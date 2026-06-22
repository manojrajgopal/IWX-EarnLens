"""Controller orchestrating auth flows and shaping API responses."""
from __future__ import annotations

from typing import Any, Dict

from app.modules.auth.schemas.auth_schemas import (
    AuthResult,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    RegistrationPending,
    ResendOtpRequest,
    ResetPasswordRequest,
    TokenPair,
    VerifyRegistrationRequest,
)
from app.modules.auth.services.auth_service import AuthService
from app.modules.users.schemas.user_schemas import UserPublic


class AuthController:
    def __init__(self, service: AuthService) -> None:
        self.service = service

    async def start_registration(
        self, payload: RegisterRequest
    ) -> RegistrationPending:
        result = await self.service.start_registration(payload)
        return RegistrationPending.model_validate(result)

    async def verify_registration(
        self, payload: VerifyRegistrationRequest
    ) -> AuthResult:
        result = await self.service.verify_registration_otp(payload)
        return self._to_auth_result(result)

    async def resend_otp(self, payload: ResendOtpRequest) -> RegistrationPending:
        result = await self.service.resend_registration_otp(payload)
        return RegistrationPending.model_validate(result)

    async def login(self, payload: LoginRequest) -> AuthResult:
        result = await self.service.login(payload)
        return self._to_auth_result(result)

    async def refresh(self, refresh_token: str) -> TokenPair:
        return await self.service.refresh(refresh_token)

    async def logout(self, refresh_token: str) -> Dict[str, Any]:
        await self.service.logout(refresh_token)
        return {"logged_out": True}

    async def forgot_password(self, payload: ForgotPasswordRequest) -> Dict[str, Any]:
        return await self.service.forgot_password(payload)

    async def reset_password(self, payload: ResetPasswordRequest) -> Dict[str, Any]:
        await self.service.reset_password(payload)
        return {"reset": True}

    @staticmethod
    def _to_auth_result(result: Dict[str, Any]) -> AuthResult:
        return AuthResult(
            user=UserPublic.model_validate(result["user"]),
            tokens=result["tokens"],
        )
