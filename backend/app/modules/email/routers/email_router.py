"""Status, channel-catalog, and test-send endpoints for email."""
from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.modules.email.constants.email_events import EmailEvent
from app.modules.email.constants.preference_keys import EMAIL_CHANNEL_CATALOG
from app.modules.email.dependencies.email_dependencies import get_email_service
from app.modules.email.schemas.context_schemas import AuthEmailContext
from app.modules.email.services.email_service import EmailService
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/email", tags=["Email"])


@router.get("/status", response_model=APIResponse[dict])
async def email_status(
    _user: Dict[str, Any] = Depends(get_current_user),
    service: EmailService = Depends(get_email_service),
) -> APIResponse[dict]:
    """Report which provider is active and whether it can send."""
    return APIResponse(
        data={"provider": service.provider_name, "ready": service.is_ready}
    )


@router.get("/channels", response_model=APIResponse[List[dict]])
async def email_channels(
    _user: Dict[str, Any] = Depends(get_current_user),
) -> APIResponse[List[dict]]:
    """Return the catalog of email toggles for the settings UI."""
    return APIResponse(data=EMAIL_CHANNEL_CATALOG)


@router.post("/test", response_model=APIResponse[dict])
async def send_test_email(
    user: Dict[str, Any] = Depends(get_current_user),
    service: EmailService = Depends(get_email_service),
) -> APIResponse[dict]:
    """Send a welcome-style test email to the current user."""
    context = AuthEmailContext(
        email=user["email"], full_name=user.get("full_name", "")
    )
    sent = await service.send_now(EmailEvent.WELCOME, context)
    message = "Test email sent." if sent else "Test email could not be sent."
    return APIResponse(data={"sent": sent}, message=message)
