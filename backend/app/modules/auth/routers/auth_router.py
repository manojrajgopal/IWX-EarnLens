"""HTTP routes for authentication."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_current_user_id
from app.modules.auth.controllers.auth_controller import AuthController
from app.modules.auth.dependencies.auth_dependencies import get_auth_service
from app.modules.auth.schemas.auth_schemas import (
    AuthResult,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    RegistrationPending,
    ResendOtpRequest,
    ResetPasswordRequest,
    TokenPair,
    VerifyEmailRequest,
    VerifyRegistrationRequest,
)
from app.modules.auth.services.auth_service import AuthService
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


def _controller(service: AuthService = Depends(get_auth_service)) -> AuthController:
    return AuthController(service)


@router.post(
    "/register",
    response_model=APIResponse[RegistrationPending],
    status_code=status.HTTP_202_ACCEPTED,
)
async def register(
    payload: RegisterRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[RegistrationPending]:
    data = await controller.start_registration(payload)
    return APIResponse(
        data=data,
        message="Verification code sent to your email.",
    )


@router.post(
    "/register/verify",
    response_model=APIResponse[AuthResult],
    status_code=status.HTTP_201_CREATED,
)
async def verify_registration(
    payload: VerifyRegistrationRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[AuthResult]:
    data = await controller.verify_registration(payload)
    return APIResponse(data=data, message="Account created successfully.")


@router.post(
    "/register/resend-otp",
    response_model=APIResponse[RegistrationPending],
)
async def resend_otp(
    payload: ResendOtpRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[RegistrationPending]:
    data = await controller.resend_otp(payload)
    return APIResponse(data=data, message="A new verification code was sent.")


@router.post("/login", response_model=APIResponse[AuthResult])
async def login(
    payload: LoginRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[AuthResult]:
    data = await controller.login(payload)
    return APIResponse(data=data, message="Logged in successfully.")


@router.post("/refresh", response_model=APIResponse[TokenPair])
async def refresh(
    payload: RefreshRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[TokenPair]:
    data = await controller.refresh(payload.refresh_token)
    return APIResponse(data=data)


@router.post("/logout", response_model=APIResponse[dict])
async def logout(
    payload: LogoutRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[dict]:
    data = await controller.logout(payload.refresh_token)
    return APIResponse(data=data, message="Logged out.")


@router.post("/logout-all", response_model=APIResponse[dict])
async def logout_all(
    user_id: str = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
) -> APIResponse[dict]:
    await service.logout_all(user_id)
    return APIResponse(data={"logged_out": True}, message="Logged out of all sessions.")


@router.post("/forgot-password", response_model=APIResponse[dict])
async def forgot_password(
    payload: ForgotPasswordRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[dict]:
    data = await controller.forgot_password(payload)
    return APIResponse(data=data, message="If the email exists, a reset link was sent.")


@router.post("/reset-password", response_model=APIResponse[dict])
async def reset_password(
    payload: ResetPasswordRequest,
    controller: AuthController = Depends(_controller),
) -> APIResponse[dict]:
    data = await controller.reset_password(payload)
    return APIResponse(data=data, message="Password reset successfully.")


@router.post("/verify-email", response_model=APIResponse[dict])
async def verify_email(
    payload: VerifyEmailRequest,
    service: AuthService = Depends(get_auth_service),
) -> APIResponse[dict]:
    await service.verify_email(payload.token)
    return APIResponse(data={"verified": True}, message="Email verified.")
