from fastapi import APIRouter, Depends, HTTPException, Response, status

from auth import (
    clear_session_cookie,
    decode_auth_token,
    ensure_auth_configured,
    FIRST_PASSWORD_TOKEN_PURPOSE,
    get_current_user,
    hash_password,
    SESSION_TOKEN_PURPOSE,
    set_session_cookie,
    verify_password,
)
from database import get_connection
from models import FirstPasswordIn, LoginIn, RegisterIn, User

router = APIRouter(prefix="/api/auth", tags=["Authentification"])

EMAIL_ALREADY_USED = "Cette adresse e-mail est déjà utilisée."
INVALID_CREDENTIALS = "Adresse e-mail ou mot de passe incorrect."
PASSWORD_ALREADY_SET = "Le mot de passe de ce compte a déjà été défini."


def _read_user(cursor, user_id: int) -> dict:
    cursor.execute(
        "SELECT us_id, us_name, us_email, us_created_at FROM users WHERE us_id = %s",
        (user_id,),
    )
    return cursor.fetchone()


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, response: Response):
    ensure_auth_configured()
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT us_id FROM users WHERE us_email = %s", (str(data.us_email).lower(),))
        if cursor.fetchone() is not None:
            raise HTTPException(status_code=409, detail=EMAIL_ALREADY_USED)

        cursor.execute(
            "INSERT INTO users (us_name, us_email, us_password_hash) VALUES (%s, %s, %s)",
            (data.us_name.strip(), str(data.us_email).lower(), hash_password(data.password)),
        )
        connection.commit()
        user = _read_user(cursor, cursor.lastrowid)
        cursor.close()
        set_session_cookie(response, user["us_id"])
        return user
    finally:
        connection.close()


@router.post("/login", response_model=User)
def login(data: LoginIn, response: Response):
    ensure_auth_configured()
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT us_id, us_name, us_email, us_created_at, us_password_hash "
            "FROM users WHERE us_email = %s",
            (str(data.us_email).lower(),),
        )
        user = cursor.fetchone()
        if user is None or not verify_password(
            data.password,
            user.get("us_password_hash") if user else None,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=INVALID_CREDENTIALS,
            )

        cursor.close()
        set_session_cookie(response, user["us_id"])
        return User.model_validate(user)
    finally:
        connection.close()


@router.post("/first-password", response_model=User)
def set_first_password(data: FirstPasswordIn, response: Response):
    user_id = decode_auth_token(data.setup_token, FIRST_PASSWORD_TOKEN_PURPOSE)
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT us_id, us_password_hash FROM users WHERE us_id = %s",
            (user_id,),
        )
        user_state = cursor.fetchone()
        if user_state is None:
            raise HTTPException(status_code=404, detail="Compte introuvable.")
        if user_state["us_password_hash"] is not None:
            raise HTTPException(status_code=409, detail=PASSWORD_ALREADY_SET)

        cursor.execute(
            "UPDATE users SET us_password_hash = %s "
            "WHERE us_id = %s AND us_password_hash IS NULL",
            (hash_password(data.password), user_id),
        )
        if cursor.rowcount != 1:
            raise HTTPException(status_code=409, detail=PASSWORD_ALREADY_SET)
        connection.commit()

        user = _read_user(cursor, user_id)
        cursor.close()
        set_session_cookie(response, user_id)
        return user
    finally:
        connection.close()


@router.get("/me", response_model=User)
def current_user(user: User = Depends(get_current_user)):
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, user: User = Depends(get_current_user)):
    clear_session_cookie(response)
    return None
