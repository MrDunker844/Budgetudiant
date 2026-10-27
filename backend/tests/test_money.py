from datetime import date

import pytest

# Chaque test de ce fichier tourne deux fois : sur /api/expenses (ex_) et sur /api/incomes (inc_)
MONEY = pytest.mark.parametrize("table, px", [("expenses", "ex"), ("incomes", "inc")])

CREATED_AT = "2026-10-27T10:00:00"


def payload(px, **changes):
    data = {
        "user_id": 1,
        "categorie_id": 2,
        f"{px}_title": "Loyer octobre",
        f"{px}_amount": 380.0,
        f"{px}_date": "2026-10-02",
        f"{px}_description": None,
    }
    return {**data, **changes}


def db_row(px, row_id=42, **changes):
    """Une ligne telle que MySQL la renverrait (avec id et date de création)."""
    return {f"{px}_id": row_id, f"{px}_created_at": CREATED_AT, **payload(px, **changes)}


# ---------- GET liste ----------
@MONEY
def test_list(client, fake_db, table, px):
    fake_db.responses = [[db_row(px, 1), db_row(px, 2)]]
    response = client.get(f"/api/{table}/")
    assert response.status_code == 200
    assert [r[f"{px}_id"] for r in response.json()] == [1, 2]


@MONEY
def test_list_filtres_parametres(client, fake_db, table, px):
    client.get(f"/api/{table}/?user_id=1&month=2026-10")
    query, params = fake_db.queries[0]
    assert f"FROM {table}" in query and "user_id = %s" in query
    assert params == (1, date(2026, 10, 1), date(2026, 11, 1))


@MONEY
def test_list_cannot_read_other_users(client, fake_db, table, px):
    response = client.get(f"/api/{table}/?user_id=2")

    assert response.status_code == 404
    assert fake_db.queries == []


@MONEY
def test_create_cannot_assign_other_user(client, fake_db, table, px):
    response = client.post(
        f"/api/{table}/",
        json=payload(px, user_id=2),
    )

    assert response.status_code == 404
    assert fake_db.queries == []


@MONEY
def test_list_mois_invalide(client, fake_db, table, px):
    assert client.get(f"/api/{table}/?month=2026-13").status_code == 422


# ---------- GET un ----------
@MONEY
def test_get(client, fake_db, table, px):
    fake_db.responses = [[db_row(px, 7)]]
    response = client.get(f"/api/{table}/7")
    assert response.status_code == 200
    assert response.json()[f"{px}_id"] == 7


@MONEY
def test_get_introuvable(client, fake_db, table, px):
    assert client.get(f"/api/{table}/999").status_code == 404


# ---------- POST ----------
@MONEY
def test_create(client, fake_db, table, px):
    # utilisateur existe, catégorie existe, INSERT, relecture de la ligne
    fake_db.responses = [[(1,)], [(2,)], [], [db_row(px)]]
    response = client.post(f"/api/{table}/", json=payload(px))
    assert response.status_code == 201
    assert response.json() == db_row(px)
    assert fake_db.committed
    insert_query, insert_params = fake_db.queries[2]
    assert insert_query.startswith(f"INSERT INTO {table}")
    assert "created_at" not in insert_query  # rempli par MySQL
    assert insert_params[:4] == (1, 2, "Loyer octobre", 380.0)


@MONEY
def test_create_sans_categorie(client, fake_db, table, px):
    fake_db.responses = [[(1,)], [], [db_row(px, categorie_id=None)]]
    response = client.post(f"/api/{table}/", json=payload(px, categorie_id=None))
    assert response.status_code == 201
    assert response.json()["categorie_id"] is None


@MONEY
@pytest.mark.parametrize("amount", [0, -10])
def test_create_montant_non_positif(client, fake_db, table, px, amount):
    response = client.post(f"/api/{table}/", json=payload(px, **{f"{px}_amount": amount}))
    assert response.status_code == 422


@MONEY
def test_create_titre_vide(client, fake_db, table, px):
    response = client.post(f"/api/{table}/", json=payload(px, **{f"{px}_title": ""}))
    assert response.status_code == 422


@MONEY
def test_create_utilisateur_inexistant(client, fake_db, table, px):
    fake_db.responses = [[]]
    response = client.post(f"/api/{table}/", json=payload(px))
    assert response.status_code == 400
    assert response.json()["detail"] == "Utilisateur introuvable"
    assert not fake_db.committed


@MONEY
def test_create_categorie_inexistante(client, fake_db, table, px):
    fake_db.responses = [[(1,)], []]
    response = client.post(f"/api/{table}/", json=payload(px))
    assert response.status_code == 400
    assert response.json()["detail"] == "Catégorie introuvable"
    assert not fake_db.committed


# ---------- PUT ----------
@MONEY
def test_update(client, fake_db, table, px):
    changed = {f"{px}_amount": 400.0}
    # la ligne existe, utilisateur, catégorie, UPDATE, relecture
    fake_db.responses = [[db_row(px, 3)], [(1,)], [(2,)], [], [db_row(px, 3, **changed)]]
    response = client.put(f"/api/{table}/3", json=payload(px, **changed))
    assert response.status_code == 200
    assert response.json()[f"{px}_amount"] == 400.0
    assert fake_db.committed


@MONEY
def test_update_introuvable(client, fake_db, table, px):
    assert client.put(f"/api/{table}/999", json=payload(px)).status_code == 404
    assert not fake_db.committed


# ---------- DELETE ----------
@MONEY
def test_delete(client, fake_db, table, px):
    fake_db.responses = [[(3,)], []]
    assert client.delete(f"/api/{table}/3").status_code == 204
    assert fake_db.committed


@MONEY
def test_delete_introuvable(client, fake_db, table, px):
    assert client.delete(f"/api/{table}/999").status_code == 404
    assert not fake_db.committed
