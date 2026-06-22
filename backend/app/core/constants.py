"""Application-wide constant enumerations and keys."""
from __future__ import annotations

from enum import Enum


class IncomeType(str, Enum):
    SALARY = "salary"
    FREELANCE = "freelance"
    BONUS = "bonus"
    COMMISSION = "commission"
    GIFT = "gift"
    DIVIDEND = "dividend"
    BUSINESS = "business"
    ONE_TIME = "one_time"
    CUSTOM = "custom"


class RecurrenceType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    ONE_TIME = "one_time"
    CUSTOM = "custom"


class IncomeStatus(str, Enum):
    RECEIVED = "received"
    PENDING = "pending"
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"


class PaymentMode(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    PAYPAL = "paypal"
    CRYPTO = "crypto"
    CHEQUE = "cheque"
    OTHER = "other"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


class AuditAction(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    REGISTER = "register"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


# MongoDB collection names — single source of truth.
class Collections:
    USERS = "users"
    INCOMES = "incomes"
    CATEGORIES = "categories"
    SOURCES = "sources"
    TAGS = "tags"
    REFRESH_TOKENS = "refresh_tokens"
    AUDIT_LOGS = "audit_logs"
    PREFERENCES = "preferences"
    PENDING_REGISTRATIONS = "pending_registrations"
