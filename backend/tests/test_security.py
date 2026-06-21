"""Unit tests for security primitives (no database required)."""
from app.core.constants import TokenType
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_roundtrip() -> None:
    hashed = hash_password("Secret123")
    assert hashed != "Secret123"
    assert verify_password("Secret123", hashed)
    assert not verify_password("wrong", hashed)


def test_access_token_roundtrip() -> None:
    token = create_access_token("user-123", {"email": "a@b.com"})
    payload = decode_token(token, TokenType.ACCESS)
    assert payload["sub"] == "user-123"
    assert payload["type"] == TokenType.ACCESS.value
