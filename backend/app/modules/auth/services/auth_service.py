"""Authentication business logic: registration, login, token lifecycle."""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError

from app.core.config import settings
from app.core.constants import TokenType, UserRole
from app.core.exceptions import (
    BadRequestError,
    ConflictError,
    UnauthorizedError,
    ValidationError,
)
from app.core.logging_config import get_logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    token_expiry,
    verify_password,
)
from app.modules.auth.repositories.pending_registration_repository import (
    PendingRegistrationRepository,
)
from app.modules.auth.repositories.refresh_token_repository import (
    RefreshTokenRepository,
)
from app.modules.auth.schemas.auth_schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    TokenPair,
    VerifyRegistrationRequest,
)
from app.modules.auth.utils.otp import generate_otp
from app.modules.auth.validators.password_validator import validate_password_strength
from app.modules.email.constants.email_events import EmailEvent
from app.modules.email.schemas.context_schemas import AuthEmailContext
from app.modules.email.services.email_notifier import EmailNotifier
from app.modules.email.services.email_service import EmailService
from app.modules.users.repositories.user_repository import UserRepository

logger = get_logger(__name__)


class AuthService:
    """Coordinates authentication use cases and token management."""

    def __init__(
        self,
        user_repository: UserRepository,
        token_repository: RefreshTokenRepository,
        email_notifier: Optional[EmailNotifier] = None,
        pending_repository: Optional[PendingRegistrationRepository] = None,
        email_service: Optional[EmailService] = None,
    ) -> None:
        self.users = user_repository
        self.tokens = token_repository
        self.email = email_notifier
        self.pending = pending_repository
        self.email_service = email_service

    # ------------------------------------------------------------------ #
    # Registration (OTP-verified, two phase)
    # ------------------------------------------------------------------ #
    async def start_registration(self, payload: RegisterRequest) -> Dict[str, Any]:
        """Validate the form, stage the registration and email an OTP.

        No ``users`` document is created here — the account only comes into
        existence once the emailed code is confirmed via
        :meth:`verify_registration_otp`.
        """
        validate_password_strength(payload.password)
        await self._assert_unique(payload)

        if self.pending is None:
            raise BadRequestError("Registration is temporarily unavailable.")

        otp = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.OTP_EXPIRE_MINUTES
        )
        phone_raw = payload.phone.strip()

        # Drop any earlier pending attempt for this email before staging anew.
        await self.pending.delete_by_email(payload.email)
        pending = await self.pending.create_pending(
            {
                "email": payload.email.lower(),
                "username": payload.username.lower(),
                "full_name": payload.full_name.strip(),
                "phone": phone_raw or None,
                "hashed_password": hash_password(payload.password),
                "otp_hash": hash_password(otp),
                "expires_at": expires_at,
                "attempts": 0,
                "resend_count": 0,
            }
        )

        self._send_otp_email(payload.email, payload.full_name.strip(), otp)
        return self._pending_response(pending, resends_used=0)

    async def verify_registration_otp(
        self, payload: VerifyRegistrationRequest
    ) -> Dict[str, Any]:
        """Confirm the OTP and, on success, create the account + issue tokens."""
        if self.pending is None:
            raise BadRequestError("Registration is temporarily unavailable.")

        pending = await self.pending.get_pending(payload.registration_id)
        if not pending:
            raise BadRequestError(
                "This registration session has expired. Please sign up again."
            )

        if self._is_expired(pending.get("expires_at")):
            await self.pending.delete_pending(pending["id"])
            raise BadRequestError(
                "Your verification code has expired. Please sign up again."
            )

        if pending.get("attempts", 0) >= settings.OTP_MAX_ATTEMPTS:
            await self.pending.delete_pending(pending["id"])
            raise BadRequestError(
                "Too many incorrect attempts. Please sign up again."
            )

        if not verify_password(payload.otp, pending["otp_hash"]):
            attempts = await self.pending.increment_attempts(pending["id"])
            remaining = max(settings.OTP_MAX_ATTEMPTS - attempts, 0)
            if remaining <= 0:
                await self.pending.delete_pending(pending["id"])
                raise ValidationError(
                    "Too many incorrect attempts. Please sign up again.",
                    details={"field": "otp"},
                )
            raise ValidationError(
                f"Incorrect code. {remaining} attempt(s) remaining.",
                details={"field": "otp"},
            )

        user = await self._create_user(pending)
        await self.pending.delete_pending(pending["id"])

        tokens = await self._issue_tokens(user["id"], user["email"])
        await self._notify(
            user["id"],
            EmailEvent.WELCOME,
            AuthEmailContext(email=user["email"], full_name=user["full_name"]),
        )
        return {"user": user, "tokens": tokens}

    async def resend_registration_otp(
        self, payload: ResendOtpRequest
    ) -> Dict[str, Any]:
        """Issue a fresh OTP for an in-flight registration and email it again."""
        if self.pending is None:
            raise BadRequestError("Registration is temporarily unavailable.")

        pending = await self.pending.get_pending(payload.registration_id)
        if not pending:
            raise BadRequestError(
                "This registration session has expired. Please sign up again."
            )

        resend_count = int(pending.get("resend_count", 0))
        if resend_count >= settings.OTP_MAX_RESENDS:
            raise BadRequestError(
                "You've reached the maximum number of code resends. "
                "Please sign up again."
            )

        otp = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.OTP_EXPIRE_MINUTES
        )
        new_count = resend_count + 1
        updated = await self.pending.set_otp(
            pending["id"], hash_password(otp), expires_at, new_count
        )
        self._send_otp_email(pending["email"], pending.get("full_name", ""), otp)
        return self._pending_response(updated or pending, resends_used=new_count)

    async def login(self, payload: LoginRequest) -> Dict[str, Any]:
        user = await self.users.get_by_identifier(payload.identifier)
        if not user or not verify_password(payload.password, user["hashed_password"]):
            raise UnauthorizedError("Invalid username/email or password.")
        if not user.get("is_active", False):
            raise UnauthorizedError("This account has been deactivated.")

        await self.users.update(user["id"], {"last_login_at": datetime.now(timezone.utc)})
        tokens = await self._issue_tokens(user["id"], user["email"])
        user = await self.users.get_by_id(user["id"])
        await self._notify(
            user["id"],
            EmailEvent.LOGIN_ALERT,
            AuthEmailContext(email=user["email"], full_name=user["full_name"]),
        )
        return {"user": user, "tokens": tokens}

    # ------------------------------------------------------------------ #
    # Token lifecycle
    # ------------------------------------------------------------------ #
    async def refresh(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token, TokenType.REFRESH)
        except JWTError as exc:
            raise UnauthorizedError("Invalid refresh token.") from exc

        stored = await self.tokens.find_valid(refresh_token)
        if not stored:
            raise UnauthorizedError("Refresh token revoked or expired.")

        # Rotate: revoke old token, issue a fresh pair.
        await self.tokens.revoke(refresh_token)
        return await self._issue_tokens(payload["sub"], payload.get("email", ""))

    async def logout(self, refresh_token: str) -> None:
        await self.tokens.revoke(refresh_token)

    async def logout_all(self, user_id: str) -> None:
        await self.tokens.revoke_all_for_user(user_id)

    # ------------------------------------------------------------------ #
    # Password recovery (ready structure)
    # ------------------------------------------------------------------ #
    async def forgot_password(self, payload: ForgotPasswordRequest) -> Dict[str, Any]:
        user = await self.users.get_by_email(payload.email)
        # Always return success to avoid user enumeration.
        if not user:
            return {"reset_token": None}

        reset_token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(
            minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES
        )
        await self.users.update(
            user["id"],
            {"password_reset_token": reset_token, "password_reset_expires": expires},
        )
        reset_link = f"{settings.FRONTEND_BASE_URL}/reset-password?token={reset_token}"
        await self._notify(
            user["id"],
            EmailEvent.PASSWORD_RESET,
            AuthEmailContext(
                email=user["email"],
                full_name=user["full_name"],
                reset_link=reset_link,
            ),
        )
        # In production the token would be emailed; returned here for dev wiring.
        return {"reset_token": reset_token}

    async def reset_password(self, payload: ResetPasswordRequest) -> None:
        validate_password_strength(payload.new_password)
        user = await self.users.get_by_reset_token(payload.token)
        if not user:
            raise UnauthorizedError("Invalid or expired reset token.")

        expires = user.get("password_reset_expires")
        if expires and _ensure_aware(expires) < datetime.now(timezone.utc):
            raise UnauthorizedError("Reset token has expired.")

        await self.users.update(
            user["id"],
            {
                "hashed_password": hash_password(payload.new_password),
                "password_reset_token": None,
                "password_reset_expires": None,
            },
        )
        await self.tokens.revoke_all_for_user(user["id"])
        await self._notify(
            user["id"],
            EmailEvent.PASSWORD_CHANGED,
            AuthEmailContext(email=user["email"], full_name=user["full_name"]),
        )

    async def verify_email(self, token: str) -> None:
        user = await self.users.get_by_verify_token(token)
        if not user:
            raise UnauthorizedError("Invalid verification token.")
        await self.users.update(
            user["id"], {"is_email_verified": True, "email_verify_token": None}
        )

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    async def _assert_unique(self, payload: RegisterRequest) -> None:
        """Reject the form early if email/username/phone are already taken."""
        if await self.users.get_by_email(payload.email):
            raise ConflictError(
                "An account with this email already exists.",
                details={"field": "email"},
            )
        if await self.users.get_by_username(payload.username):
            raise ConflictError(
                "This username is already taken.",
                details={"field": "username"},
            )
        phone_raw = payload.phone.strip()
        if phone_raw and await self.users.get_by_phone(phone_raw):
            raise ConflictError(
                "This phone number is already registered.",
                details={"field": "phone"},
            )

    async def _create_user(self, pending: Dict[str, Any]) -> Dict[str, Any]:
        """Materialise a verified user from a confirmed pending registration."""
        # Guard against the identity being claimed between the two steps.
        if await self.users.get_by_email(pending["email"]):
            raise ConflictError(
                "An account with this email already exists.",
                details={"field": "email"},
            )
        return await self.users.create(
            {
                "email": pending["email"].lower(),
                "username": pending["username"].lower(),
                "hashed_password": pending["hashed_password"],
                "full_name": pending["full_name"].strip(),
                "phone": pending.get("phone") or None,
                "role": UserRole.USER.value,
                "is_active": True,
                "is_email_verified": True,
                "default_currency": settings.DEFAULT_CURRENCY,
                "email_verify_token": None,
            }
        )

    def _send_otp_email(self, email: str, full_name: str, otp: str) -> None:
        """Email the verification code, bypassing preference gating.

        The account (and its preferences) does not exist yet, and the email
        *is* the verification mechanism, so it is always sent.
        """
        if self.email_service is None:
            logger.warning("No email service configured; OTP cannot be delivered.")
            return
        context = AuthEmailContext(
            email=email,
            full_name=full_name,
            otp_code=otp,
            otp_expiry_minutes=settings.OTP_EXPIRE_MINUTES,
        )
        self.email_service.send(EmailEvent.REGISTRATION_OTP, context)

    @staticmethod
    def _pending_response(
        pending: Dict[str, Any], *, resends_used: int
    ) -> Dict[str, Any]:
        expires_at = _ensure_aware(pending["expires_at"])
        remaining = int((expires_at - datetime.now(timezone.utc)).total_seconds())
        return {
            "registration_id": pending["id"],
            "email": pending["email"],
            "expires_in": max(remaining, 0),
            "resends_remaining": max(settings.OTP_MAX_RESENDS - resends_used, 0),
        }

    @staticmethod
    def _is_expired(expires_at: Optional[datetime]) -> bool:
        if not expires_at:
            return True
        return _ensure_aware(expires_at) < datetime.now(timezone.utc)

    async def _notify(
        self, user_id: str, event: EmailEvent, context: AuthEmailContext
    ) -> None:
        """Send an auth email if a notifier is wired; never raise."""
        if self.email is None:
            return
        await self.email.notify(user_id, event, context)

    async def _issue_tokens(self, user_id: str, email: str) -> TokenPair:
        access = create_access_token(user_id, {"email": email})
        refresh = create_refresh_token(user_id, {"email": email})
        await self.tokens.store(user_id, refresh, token_expiry(TokenType.REFRESH))
        return TokenPair(access_token=access, refresh_token=refresh)


def _ensure_aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
