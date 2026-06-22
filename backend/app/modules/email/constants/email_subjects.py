"""Human-friendly subject lines for each email event."""
from __future__ import annotations

from typing import Dict

from app.modules.email.constants.email_events import EmailEvent

EMAIL_SUBJECTS: Dict[EmailEvent, str] = {
    EmailEvent.REGISTRATION_OTP: "Your IWX-EarnLens verification code",
    EmailEvent.WELCOME: "Welcome to IWX-EarnLens 🎉",
    EmailEvent.LOGIN_ALERT: "New sign-in to your IWX-EarnLens account",
    EmailEvent.PASSWORD_RESET: "Reset your IWX-EarnLens password",
    EmailEvent.PASSWORD_CHANGED: "Your IWX-EarnLens password was changed",
    EmailEvent.INCOME_CREATED: "Income added to IWX-EarnLens",
    EmailEvent.INCOME_UPDATED: "An income entry was updated",
    EmailEvent.INCOME_DELETED: "An income entry was deleted",
}
