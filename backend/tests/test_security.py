from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from jose import jwt
from sqlalchemy import text

from app.core.config import settings
from app.core.dependencies import get_current_user  
from app.core.security import (
    ALGORITHM,
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.session import SessionLocal, engine


def test_password_hash_is_not_plain_text():
    password = "StrongTest@123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True


def test_password_verification_rejects_wrong_password():
    hashed = hash_password("StrongTest@123")

    assert verify_password("WrongPassword@123", hashed) is False


def test_access_token_contains_subject_and_expiration():
    token = create_access_token("123")
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[ALGORITHM],
    )

    assert payload["sub"] == "123"
    assert "exp" in payload
    assert payload["exp"] > int(
        datetime.now(timezone.utc).timestamp()
    )


def test_expired_token_is_rejected():
    token = jwt.encode(
        {
            "sub": "123",
            "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
        },
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )

    with SessionLocal() as db:
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token=token, db=db)

    assert exc_info.value.status_code == 401


def test_invalid_signature_is_rejected():
    token = jwt.encode(
        {
            "sub": "123",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        "a-different-test-secret-key",
        algorithm=ALGORITHM,
    )

    with SessionLocal() as db:
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token=token, db=db)

    assert exc_info.value.status_code == 401


def test_malformed_token_subject_is_rejected():
    token = create_access_token("not-an-integer")

    with SessionLocal() as db:
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token=token, db=db)

    assert exc_info.value.status_code == 401


def test_inactive_user_is_rejected():
    token = create_access_token("123")
    inactive_user = Mock()
    inactive_user.id = 123
    inactive_user.is_active = False

    db = Mock()
    db.scalar.return_value = inactive_user

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(token=token, db=db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Could not validate credentials."


def test_case_insensitive_email_unique_index_exists():
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT indexdef
                FROM pg_indexes
                WHERE tablename = :table_name
                  AND indexname = :index_name
            """),
            {
                "table_name": "users",
                "index_name": "ix_users_email_lower_unique",
            },
        )

        index_definition = result.scalar_one_or_none()

    assert index_definition is not None
    assert "UNIQUE INDEX" in index_definition.upper()
    assert "LOWER" in index_definition.upper()
