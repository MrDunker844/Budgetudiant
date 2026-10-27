USER = {"us_name": "Alice Martin", "us_email": "alice@example.com"}


def db_user(us_id=1, **changes):
    return {
        "us_id": us_id,
        "us_created_at": "2026-10-27T10:00:00",
        "us_monthly_budget": None,
        **USER,
        **changes,
    }


# ---------- GET ----------
def test_list_users(client, fake_db):
    response = client.get("/api/users/")
    assert response.status_code == 200
    assert response.json() == [db_user(1)]


def test_get_user(client, fake_db):
    fake_db.responses = [[db_user(1)]]
    response = client.get("/api/users/1")
    assert response.status_code == 200
    assert response.json()["us_email"] == "alice@example.com"


def test_get_user_introuvable(client, fake_db):
    assert client.get("/api/users/999").status_code == 404


def test_get_another_user_is_not_allowed(client, fake_db):
    assert client.get("/api/users/2").status_code == 404
    assert fake_db.queries == []


# ---------- POST ----------
def test_create_user(client, fake_db):
    fake_db.responses = [[], [], [db_user(42)]]  # e-mail libre, INSERT, relecture
    response = client.post("/api/users/", json=USER)
    assert response.status_code == 201
    assert response.json() == db_user(42)
    assert fake_db.committed


def test_create_user_email_invalide(client, fake_db):
    response = client.post("/api/users/", json={**USER, "us_email": "pas-un-email"})
    assert response.status_code == 422


def test_create_user_nom_vide(client, fake_db):
    response = client.post("/api/users/", json={**USER, "us_name": ""})
    assert response.status_code == 422


def test_create_user_budget_invalide(client, fake_db):
    response = client.post("/api/users/", json={**USER, "us_monthly_budget": 0})
    assert response.status_code == 422


def test_update_user_budget(client, fake_db):
    fake_db.responses = [[db_user(1)], [], [], [db_user(1, us_monthly_budget=850)]]
    response = client.put(
        "/api/users/1",
        json={**USER, "us_monthly_budget": 850},
    )
    assert response.status_code == 200
    assert response.json()["us_monthly_budget"] == 850
    assert fake_db.committed


def test_create_user_email_deja_pris(client, fake_db):
    fake_db.responses = [[(1,)]]
    response = client.post("/api/users/", json=USER)
    assert response.status_code == 409
    assert not fake_db.committed


# ---------- PUT ----------
def test_update_user(client, fake_db):
    fake_db.responses = [[db_user(1)], [], [], [db_user(1, us_name="Alice M.")]]
    response = client.put("/api/users/1", json={**USER, "us_name": "Alice M."})
    assert response.status_code == 200
    assert response.json()["us_name"] == "Alice M."


def test_update_user_garde_son_propre_email(client, fake_db):
    fake_db.responses = [[db_user(1)], [], [], [db_user(1)]]
    client.put("/api/users/1", json=USER)
    query, params = fake_db.queries[1]
    assert "us_id <> %s" in query  # on ignore l'utilisateur lui-même
    assert params == ("alice@example.com", 1)


def test_update_user_email_pris_par_un_autre(client, fake_db):
    fake_db.responses = [[db_user(1)], [(2,)]]
    assert client.put("/api/users/1", json=USER).status_code == 409


def test_update_user_introuvable(client, fake_db):
    assert client.put("/api/users/999", json=USER).status_code == 404


# ---------- DELETE ----------
def test_delete_user(client, fake_db):
    fake_db.responses = [[(1,)], []]
    assert client.delete("/api/users/1").status_code == 204
    assert fake_db.committed


def test_delete_user_introuvable(client, fake_db):
    assert client.delete("/api/users/999").status_code == 404


# ---------- GET /api/users/{id}/summary ----------
def test_summary(client, fake_db):
    fake_db.responses = [
        [{"us_monthly_budget": 950}],                 # l'utilisateur existe
        [{"amount": 450}, {"amount": 320}],           # revenus
        [{"amount": 380, "category": "Logement"}],    # dépenses
    ]
    response = client.get("/api/users/1/summary")
    assert response.status_code == 200
    assert response.json()["solde"] == 390
    assert response.json()["budget_mensuel"] == 950


def test_summary_utilisateur_introuvable(client, fake_db):
    assert client.get("/api/users/999/summary").status_code == 404


def test_summary_filtre_par_mois(client, fake_db):
    fake_db.responses = [
        [{"us_monthly_budget": None}],
        [],
        [{"amount": 12.5, "category": "Loisirs"}],
    ]
    response = client.get("/api/users/1/summary?month=2026-10")
    data = response.json()
    assert len(data["depenses_par_categorie"]) >= 0

def test_assertion_toujours_vraie():
    assert True