"""Maps each EmailEvent to the template that renders its body."""
from __future__ import annotations

from typing import Callable, Dict, Tuple, Union

from app.modules.email.constants.email_events import EmailEvent
from app.modules.email.schemas.context_schemas import (
    AuthEmailContext,
    IncomeEmailContext,
)
from app.modules.email.templates.auth.login_alert_template import LoginAlertTemplate
from app.modules.email.templates.auth.password_changed_template import (
    PasswordChangedTemplate,
)
from app.modules.email.templates.auth.password_reset_template import (
    PasswordResetTemplate,
)
from app.modules.email.templates.auth.registration_otp_template import (
    RegistrationOtpTemplate,
)
from app.modules.email.templates.auth.welcome_template import WelcomeTemplate
from app.modules.email.templates.income.income_created_template import (
    IncomeCreatedTemplate,
)
from app.modules.email.templates.income.income_deleted_template import (
    IncomeDeletedTemplate,
)
from app.modules.email.templates.income.income_updated_template import (
    IncomeUpdatedTemplate,
)

AnyContext = Union[AuthEmailContext, IncomeEmailContext]
Renderer = Callable[[AnyContext], Tuple[str, str]]


class TemplateRegistry:
    """Single lookup table from event to its renderer callable."""

    _REGISTRY: Dict[EmailEvent, Renderer] = {
        EmailEvent.REGISTRATION_OTP: RegistrationOtpTemplate.render,
        EmailEvent.WELCOME: WelcomeTemplate.render,
        EmailEvent.LOGIN_ALERT: LoginAlertTemplate.render,
        EmailEvent.PASSWORD_RESET: PasswordResetTemplate.render,
        EmailEvent.PASSWORD_CHANGED: PasswordChangedTemplate.render,
        EmailEvent.INCOME_CREATED: IncomeCreatedTemplate.render,
        EmailEvent.INCOME_UPDATED: IncomeUpdatedTemplate.render,
        EmailEvent.INCOME_DELETED: IncomeDeletedTemplate.render,
    }

    @classmethod
    def resolve(cls, event: EmailEvent) -> Renderer:
        renderer = cls._REGISTRY.get(event)
        if renderer is None:
            raise KeyError(f"No template registered for event '{event}'.")
        return renderer
