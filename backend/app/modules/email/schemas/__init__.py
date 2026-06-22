"""Typed contexts that callers pass when requesting an email."""
from app.modules.email.schemas.context_schemas import (
    AuthEmailContext,
    IncomeEmailContext,
)

__all__ = ["AuthEmailContext", "IncomeEmailContext"]
