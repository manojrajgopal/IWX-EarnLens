"""Income-event email templates."""
from app.modules.email.templates.income.income_created_template import (
    IncomeCreatedTemplate,
)
from app.modules.email.templates.income.income_deleted_template import (
    IncomeDeletedTemplate,
)
from app.modules.email.templates.income.income_updated_template import (
    IncomeUpdatedTemplate,
)

__all__ = [
    "IncomeCreatedTemplate",
    "IncomeUpdatedTemplate",
    "IncomeDeletedTemplate",
]
