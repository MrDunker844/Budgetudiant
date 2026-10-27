from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import get_current_user
from database import get_connection
from models import User

MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"  # ex. 2026-10


def month_range(month: str) -> tuple[date, date]:
    """'2026-10' -> (2026-10-01, 2026-11-01) : début inclus, fin exclue."""
    start = datetime.strptime(month, "%Y-%m").date()
    if start.month == 12:
        end = date(start.year + 1, 1, 1)
    else:
        end = date(start.year, start.month + 1, 1)
    return start, end


def month_filter(column: str, month: Optional[str]) -> tuple[str, list]:
    """Morceau de WHERE pour garder un seul mois : (" AND col >= %s AND col < %s", [début, fin])."""
    if not month:
        return "", []
    start, end = month_range(month)
    return f" AND {column} >= %s AND {column} < %s", [start, end]


def row_exists(cursor, table: str, id_column: str, value) -> bool:
    # Table et colonne viennent toujours du code, jamais de l'utilisateur : seule la valeur est paramétrée
    cursor.execute(f"SELECT {id_column} FROM {table} WHERE {id_column} = %s", (value,))
    return cursor.fetchone() is not None


def check_user_and_category(cursor, user_id: int, categorie_id: Optional[int]):
    """400 si l'utilisateur ou la catégorie n'existe pas (au lieu d'une erreur MySQL 500)."""
    if not row_exists(cursor, "users", "us_id", user_id):
        raise HTTPException(status_code=400, detail="Utilisateur introuvable")
    if categorie_id is not None and not row_exists(cursor, "categories", "cat_id", categorie_id):
        raise HTTPException(status_code=400, detail="Catégorie introuvable")


def make_money_router(table: str, px: str, model_in, model_out, tag: str, label: str) -> APIRouter:
    """Crée le CRUD complet de expenses ou incomes.
    Les deux tables ont la même structure, seul le préfixe des colonnes change (ex_ / inc_)."""
    router = APIRouter(prefix=f"/api/{table}", tags=[tag])
    id_col = f"{px}_id"
    date_col = f"{px}_date"
    columns = ["user_id", "categorie_id", f"{px}_title", f"{px}_amount", date_col, f"{px}_description"]
    not_found = f"{label} introuvable"

    def fetch(cursor, row_id: int, user_id: int):
        cursor.execute(
            f"SELECT * FROM {table} WHERE {id_col} = %s AND user_id = %s",
            (row_id, user_id),
        )
        return cursor.fetchone()

    @router.get("/", response_model=list[model_out], summary=f"Lister les {tag.lower()}")
    def list_rows(
        user_id: Optional[int] = None,
        month: Optional[str] = Query(default=None, pattern=MONTH_PATTERN),
        current_user: User = Depends(get_current_user),
    ):
        if user_id is not None and user_id != current_user.us_id:
            raise HTTPException(status_code=404, detail="Ressource introuvable")
        where, params = " WHERE user_id = %s", [current_user.us_id]
        month_sql, month_params = month_filter(date_col, month)
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                f"SELECT * FROM {table}{where}{month_sql} ORDER BY {date_col} DESC, {id_col} DESC",
                params + month_params,
            )
            rows = cursor.fetchall()
            cursor.close()
            return rows
        finally:
            conn.close()

    @router.get("/{row_id}", response_model=model_out, summary=f"Lire un(e) {label.lower()}")
    def get_row(row_id: int, current_user: User = Depends(get_current_user)):
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            row = fetch(cursor, row_id, current_user.us_id)
            cursor.close()
            if row is None:
                raise HTTPException(status_code=404, detail=not_found)
            return row
        finally:
            conn.close()

    @router.post("/", response_model=model_out, status_code=201, summary=f"Créer un(e) {label.lower()}")
    def create_row(
        data: model_in,
        current_user: User = Depends(get_current_user),
    ):
        if data.user_id != current_user.us_id:
            raise HTTPException(status_code=404, detail="Ressource introuvable")
        values = data.model_dump()
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            check_user_and_category(cursor, data.user_id, data.categorie_id)
            placeholders = ", ".join(["%s"] * len(columns))
            cursor.execute(
                f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})",
                [values[c] for c in columns],
            )
            conn.commit()
            # On relit la ligne pour renvoyer aussi l'id et la date de création
            row = fetch(cursor, cursor.lastrowid, current_user.us_id)
            cursor.close()
            return row
        finally:
            conn.close()

    @router.put("/{row_id}", response_model=model_out, summary=f"Modifier un(e) {label.lower()}")
    def update_row(
        row_id: int,
        data: model_in,
        current_user: User = Depends(get_current_user),
    ):
        if data.user_id != current_user.us_id:
            raise HTTPException(status_code=404, detail="Ressource introuvable")
        values = data.model_dump()
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            # On vérifie l'existence avant : MySQL renvoie rowcount = 0 si les valeurs n'ont pas changé
            if fetch(cursor, row_id, current_user.us_id) is None:
                raise HTTPException(status_code=404, detail=not_found)
            check_user_and_category(cursor, data.user_id, data.categorie_id)
            assignments = ", ".join(f"{c} = %s" for c in columns)
            cursor.execute(
                f"UPDATE {table} SET {assignments} WHERE {id_col} = %s",
                [values[c] for c in columns] + [row_id],
            )
            conn.commit()
            row = fetch(cursor, row_id, current_user.us_id)
            cursor.close()
            return row
        finally:
            conn.close()

    @router.delete("/{row_id}", status_code=204, summary=f"Supprimer un(e) {label.lower()}")
    def delete_row(row_id: int, current_user: User = Depends(get_current_user)):
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                f"SELECT {id_col} FROM {table} WHERE {id_col} = %s AND user_id = %s",
                (row_id, current_user.us_id),
            )
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail=not_found)
            cursor.execute(f"DELETE FROM {table} WHERE {id_col} = %s", (row_id,))
            conn.commit()
            cursor.close()
        finally:
            conn.close()

    return router
