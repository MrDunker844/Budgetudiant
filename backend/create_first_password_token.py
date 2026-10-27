import argparse
from datetime import timedelta

from auth import (
    FIRST_PASSWORD_TOKEN_HOURS,
    FIRST_PASSWORD_TOKEN_PURPOSE,
    create_auth_token,
)
from database import get_connection


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate a one-time first-password setup token for an existing account."
    )
    parser.add_argument("email", help="Email address of the existing account")
    email = parser.parse_args().email.strip().lower()

    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT us_id, us_name, us_password_hash FROM users WHERE us_email = %s",
            (email,),
        )
        user = cursor.fetchone()
        cursor.close()
    finally:
        connection.close()

    if user is None:
        parser.error("No account exists for that email address.")
    if user["us_password_hash"] is not None:
        parser.error("This account already has a password.")

    token = create_auth_token(
        user["us_id"],
        FIRST_PASSWORD_TOKEN_PURPOSE,
        timedelta(hours=FIRST_PASSWORD_TOKEN_HOURS),
    )
    print(f"Account: {user['us_name']} <{email}>")
    print(f"Setup link: /setup-password?token={token}")


if __name__ == "__main__":
    main()
