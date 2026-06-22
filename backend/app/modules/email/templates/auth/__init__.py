"""Authentication-related email templates."""
from app.modules.email.templates.auth.login_alert_template import LoginAlertTemplate
from app.modules.email.templates.auth.password_changed_template import (
    PasswordChangedTemplate,
)
from app.modules.email.templates.auth.password_reset_template import (
    PasswordResetTemplate,
)
from app.modules.email.templates.auth.welcome_template import WelcomeTemplate

__all__ = [
    "WelcomeTemplate",
    "LoginAlertTemplate",
    "PasswordResetTemplate",
    "PasswordChangedTemplate",
]
