import pytest
from fastapi.testclient import TestClient

import auth as auth_service
from auth import get_current_user
from main import app
from models import User
from routers import auth, categories, common, users


class FakeDB:
    """Remplace MySQL pendant les tests.
    responses : une liste de résultats, un par requête exécutée, dans l'ordre.
    queries   : toutes les requêtes reçues, pour vérifier le SQL envoyé."""

    def __init__(self):
        self.responses = []
        self.queries = []
        self.committed = False


class FakeCursor:
    def __init__(self, db):
        self.db = db
        self.rows = []
        self.lastrowid = 42
        self.rowcount = 1

    def execute(self, query, params=()):
        self.db.queries.append((query, tuple(params)))
        self.rows = self.db.responses.pop(0) if self.db.responses else []

    def fetchone(self):
        return self.rows[0] if self.rows else None

    def fetchall(self):
        return self.rows

    def close(self):
        pass


class FakeConnection:
    def __init__(self, db):
        self.db = db

    def cursor(self, dictionary=False):
        return FakeCursor(self.db)

    def commit(self):
        self.db.committed = True

    def close(self):
        pass


@pytest.fixture
def fake_db(monkeypatch):
    db = FakeDB()
    # Chaque module a fait "from database import get_connection" : c'est SA copie du nom qu'on remplace
    for module in (auth_service, auth, categories, common, users):
        monkeypatch.setattr(module, "get_connection", lambda: FakeConnection(db))
    return db


@pytest.fixture
def client():
    test_user = User(
        us_id=1,
        us_name="Alice Martin",
        us_email="alice@example.com",
        us_created_at="2026-10-27T10:00:00",
    )
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def anonymous_client():
    with TestClient(app) as test_client:
        yield test_client
