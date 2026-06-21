"""HTTP routes for the activity/audit log."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_current_user_id
from app.modules.audit.dependencies.audit_dependencies import get_audit_service
from app.modules.audit.schemas.audit_schemas import AuditLogPublic
from app.modules.audit.services.audit_service import AuditService
from app.shared.pagination import PageParams
from app.shared.schemas import PaginatedResponse

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("", response_model=PaginatedResponse[AuditLogPublic])
async def list_activity(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    service: AuditService = Depends(get_audit_service),
) -> PaginatedResponse[AuditLogPublic]:
    params = PageParams(page=page, page_size=page_size)
    items = await service.list(user_id, skip=params.skip, limit=params.limit)
    total = await service.count(user_id)
    return PaginatedResponse(
        data=[AuditLogPublic.model_validate(i) for i in items],
        meta=params.meta(total),
    )
