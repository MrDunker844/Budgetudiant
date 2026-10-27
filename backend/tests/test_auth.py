from datetime import timedelta

from auth import AUTH_COOKIE_NAME, create_auth_token


USER = {
    "us_id": 1,
    "us_name": "Alice Martin",
    "us_email": "alice@example.com",
    "us_monthly_budget": None,
    "us_created_at": "2026-10-27T10:00:00",
}
REGISTERED_USER = {**USER, "us_id": 42}


def test_private_routes_require_session(anonymous_client):
    assert anonymous_client.get("/api/users/").status_code == 401
    assert anonymous_client.get("/api/users/1/summary").status_code == 401
    assert anonymous_client.get("/api/expenses/").status_code == 401
    assert anonymous_client.get("/api/incomes/").status_code == 401


def test_current_user_reads_identity_from_signed_cookie(
    anonymous_client, fake_db, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")
    token = create_auth_token(1, "session", timedelta(hours=1))
    anonymous_client.cookies.set(AUTH_COOKIE_NAME, token)
    fake_db.responses = [[USER]]

    response = anonymous_client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json() == USER
    assert "password" not in response.json()


def test_logout_clears_session_cookie(
    anonymous_client, fake_db, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")
    token = create_auth_token(1, "session", timedelta(hours=1))
    anonymous_client.cookies.set(AUTH_COOKIE_NAME, token)
    fake_db.responses = [[USER]]

    response = anonymous_client.post("/api/auth/logout")

    assert response.status_code == 204
    assert "budgetudiant_session=" in response.headers["set-cookie"]
    assert "max-age=0" in response.headers["set-cookie"].lower()


def test_unconfigured_secret_prevents_account_creation(
    anonymous_client, monkeypatch
):
    monkeypatch.delenv("AUTH_SECRET", raising=False)

    response = anonymous_client.post(
        "/api/auth/register",
        json={
            "us_name": "Alice Martin",
            "us_email": "alice@example.com",
            "password": "secure-password-123",
        },
    )

    assert response.status_code == 503


def test_password_setup_cannot_be_reused(
    anonymous_client, fake_db, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")
    fake_db.responses = [[{"us_id": 1, "us_password_hash": "already-set"}]]
    token = create_auth_token(1, "first-password", timedelta(hours=1))

    response = anonymous_client.post(
        "/api/auth/first-password",
        json={"setup_token": token, "password": "secure-password-123"},
    )

    assert response.status_code == 409
    assert not fake_db.committed


def test_register_creates_hashed_password_and_session(
    anonymous_client, fake_db, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")
    monkeypatch.setattr("routers.auth.hash_password", lambda _: "argon-hash")
    fake_db.responses = [[], [], [REGISTERED_USER]]

    response = anonymous_client.post(
        "/api/auth/register",
        json={
            "us_name": " Alice Martin ",
            "us_email": "ALICE@example.com",
            "password": "secure-password-123",
        },
    )

    assert response.status_code == 201
    assert response.json()["us_id"] == 42
    assert "budgetudiant_session=" in response.headers["set-cookie"]
    insert_query, insert_params = fake_db.queries[1]
    assert "us_password_hash" in insert_query
    assert insert_params == (
        "Alice Martin",
        "alice@example.com",
        "argon-hash",
    )


def test_login_issues_http_only_cookie(
    anonymous_client, fake_db, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")
    monkeypatch.setattr("routers.auth.verify_password", lambda password, hashed: True)
    fake_db.responses = [[{**USER, "us_password_hash": "argon-hash"}]]

    response = anonymous_client.post(
        "/api/auth/login",
        json={"us_email": USER["us_email"], "password": "secure-password-123"},
    )

    assert response.status_code == 200
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=lax" in response.headers["set-cookie"].lower()


def test_invalid_login_returns_generic_error(
    anonymous_client, fake_db, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")
    monkeypatch.setattr("routers.auth.verify_password", lambda password, hashed: False)
    fake_db.responses = [[]]

    response = anonymous_client.post(
        "/api/auth/login",
        json={"us_email": USER["us_email"], "password": "incorrect-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Adresse e-mail ou mot de passe incorrect."


def test_first_password_setup_is_one_time(
    anonymous_client, fake_db, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")
    monkeypatch.setattr("routers.auth.hash_password", lambda _: "argon-hash")
    fake_db.responses = [
        [{"us_id": 1, "us_password_hash": None}],
        [],
        [USER],
    ]
    token = create_auth_token(1, "first-password", timedelta(hours=1))

    response = anonymous_client.post(
        "/api/auth/first-password",
        json={"setup_token": token, "password": "secure-password-123"},
    )

    assert response.status_code == 200
    assert fake_db.committed
    update_query, update_params = fake_db.queries[1]
    assert "us_password_hash IS NULL" in update_query
    assert update_params == ("argon-hash", 1)


def test_expired_or_invalid_setup_token_is_rejected(
    anonymous_client, monkeypatch
):
    monkeypatch.setenv("AUTH_SECRET", "test-secret-value-that-is-at-least-32-chars")

    response = anonymous_client.post(
        "/api/auth/first-password",
        json={"setup_token": "not-a-token", "password": "secure-password-123"},
    )

    assert response.status_code == 401


# ---------- R8 : changement de mot de passe ----------
NEW_PASSWORD_BODY = {
    "current_password": "old-password-123",
    "new_password": "new-secure-password-456",
}


def test_r8_change_password_updates_hash(client, fake_db, monkeypatch):
    monkeypatch.setattr("routers.auth.verify_password", lambda password, hashed: True)
    monkeypatch.setattr("routers.auth.hash_password", lambda _: "new-argon-hash")
    fake_db.responses = [[{"us_password_hash": "old-argon-hash"}], []]

    response = client.post("/api/auth/change-password", json=NEW_PASSWORD_BODY)

    assert response.status_code == 204
    assert fake_db.committed
    update_query, update_params = fake_db.queries[1]
    assert "SET us_password_hash" in update_query
    assert update_params == ("new-argon-hash", 1)


def test_r8_change_password_keeps_session_open(client, fake_db, monkeypatch):
    monkeypatch.setattr("routers.auth.verify_password", lambda password, hashed: True)
    fake_db.responses = [[{"us_password_hash": "old-argon-hash"}], []]

    response = client.post("/api/auth/change-password", json=NEW_PASSWORD_BODY)

    # Aucun cookie supprimé : l'utilisateur reste connecté
    assert "set-cookie" not in response.headers


def test_r8_wrong_current_password_returns_400(client, fake_db, monkeypatch):
    monkeypatch.setattr("routers.auth.verify_password", lambda password, hashed: False)
    fake_db.responses = [[{"us_password_hash": "old-argon-hash"}]]

    response = client.post("/api/auth/change-password", json=NEW_PASSWORD_BODY)

    assert response.status_code == 400
    assert response.json()["detail"] == "L'ancien mot de passe est incorrect."
    assert not fake_db.committed
    assert len(fake_db.queries) == 1  # pas d'UPDATE


def test_r8_new_password_too_short_is_rejected(client, fake_db):
    response = client.post(
        "/api/auth/change-password",
        json={**NEW_PASSWORD_BODY, "new_password": "short"},
    )

    assert response.status_code == 422
    assert fake_db.queries == []


def test_r8_new_password_too_long_is_rejected(client, fake_db):
    response = client.post(
        "/api/auth/change-password",
        json={**NEW_PASSWORD_BODY, "new_password": "x" * 129},
    )

    assert response.status_code == 422


def test_r8_change_password_requires_session(anonymous_client):
    response = anonymous_client.post("/api/auth/change-password", json=NEW_PASSWORD_BODY)

    assert response.status_code == 401
