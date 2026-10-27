import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Cookie, HTTPException, Response
from pwdlib import PasswordHash

from database import get_connection
from models import User

AUTH_COOKIE_NAME = "budgetudiant_session"
AUTH_COOKIE_SAMESITE = "lax"
AUTH_TOKEN_ALGORITHM = "HS256"
AUTH_TOKEN_ISSUER = "budgetudiant"
SESSION_TOKEN_PURPOSE = "session"
FIRST_PASSWORD_TOKEN_PURPOSE = "first-password"
AUTH_SESSION_HOURS = 12
FIRST_PASSWORD_TOKEN_HOURS = 24
PASSWORD_HASHER = PasswordHash.recommended()
DUMMY_PASSWORD_HASH = PASSWORD_HASHER.hash("not-a-real-budgetudiant-password")


def ensure_auth_configured() -> None:
    _auth_secret()


def _auth_secret() -> str:
    secret = os.getenv("AUTH_SECRET", "")
    if len(secret) < 32:
        raise HTTPException(
            status_code=503,
            detail="L'authentification n'est pas configurée : AUTH_SECRET doit contenir au moins 32 caractères.",
        )
    return secret


def hash_password(password: str) -> str:
    return PASSWORD_HASHER.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    return PASSWORD_HASHER.verify(password, password_hash or DUMMY_PASSWORD_HASH) and bool(
        password_hash
    )


def create_auth_token(
    user_id: int,
    purpose: str,
    lifetime: timedelta,
) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "sub": str(user_id),
            "purpose": purpose,
            "iss": AUTH_TOKEN_ISSUER,
            "iat": now,
            "exp": now + lifetime,
        },
        _auth_secret(),
        algorithm=AUTH_TOKEN_ALGORITHM,
    )


def decode_auth_token(token: str, purpose: str) -> int:
    try:
        payload = jwt.decode(
            token,
            _auth_secret(),
            algorithms=[AUTH_TOKEN_ALGORITHM],
            issuer=AUTH_TOKEN_ISSUER,
            options={"require": ["sub", "purpose", "iss", "iat", "exp"]},
        )
        if payload["purpose"] != purpose:
            raise jwt.InvalidTokenError("Invalid token purpose")
        return int(payload["sub"])
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Session invalide ou expirée.") from None


def set_session_cookie(response: Response, user_id: int) -> None:
    token = create_auth_token(
        user_id,
        SESSION_TOKEN_PURPOSE,
        timedelta(hours=AUTH_SESSION_HOURS),
    )
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        max_age=int(timedelta(hours=AUTH_SESSION_HOURS).total_seconds()),
        httponly=True,
        secure=os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true",
        samesite=AUTH_COOKIE_SAMESITE,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        httponly=True,
        secure=os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true",
        samesite=AUTH_COOKIE_SAMESITE,
        path="/",
    )


def get_current_user(
    session_token: Annotated[str | None, Cookie(alias=AUTH_COOKIE_NAME)] = None,
) -> User:
    if not session_token:
        raise HTTPException(status_code=401, detail="Connecte-toi pour continuer.")

    user_id = decode_auth_token(session_token, SESSION_TOKEN_PURPOSE)
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT us_id, us_name, us_email, us_created_at FROM users WHERE us_id = %s",
            (user_id,),
        )
        user = cursor.fetchone()
        cursor.close()
        if user is None:
            raise HTTPException(status_code=401, detail="Compte introuvable.")
        return User.model_validate(user)
    finally:
        connection.close()
