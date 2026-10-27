from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import get_current_user
from database import get_connection
from models import Summary, User, UserIn
from routers.common import MONTH_PATTERN, month_filter, row_exists

router = APIRouter(prefix="/api/users", tags=["Utilisateurs"])

NOT_FOUND = "Utilisateur introuvable"


def fetch_user(cursor, us_id: int):
    cursor.execute("SELECT * FROM users WHERE us_id = %s", (us_id,))
    return cursor.fetchone()


def check_email_free(cursor, email: str, exclude_id: Optional[int] = None):
    """409 si l'e-mail est déjà pris (par un autre utilisateur que exclude_id)."""
    if exclude_id is None:
        cursor.execute("SELECT us_id FROM users WHERE us_email = %s", (email,))
    else:
        cursor.execute("SELECT us_id FROM users WHERE us_email = %s AND us_id <> %s", (email, exclude_id))
    if cursor.fetchone() is not None:
        raise HTTPException(status_code=409, detail="E-mail déjà utilisé")


def compute_summary(incomes: list[dict], expenses: list[dict]) -> dict:
    """Totaux, solde et dépenses par catégorie à partir des lignes SQL."""
    revenus = sum(float(r["amount"]) for r in incomes)
    depenses = sum(float(r["amount"]) for r in expenses)

    par_categorie: dict[Optional[str], float] = {}
    for r in expenses:
        par_categorie[r["category"]] = par_categorie.get(r["category"], 0) + float(r["amount"])

    return {
        "total_revenus": round(revenus, 2),
        "total_depenses": round(depenses, 2),
        "solde": round(revenus - depenses, 2),
        "depenses_par_categorie": [
            {"category": name, "total": round(total, 2)}
            for name, total in sorted(par_categorie.items(), key=lambda item: -item[1])
        ],
    }


@router.get("/", response_model=list[User])
def list_users(current_user: User = Depends(get_current_user)):
    return [current_user]


@router.get("/{us_id}", response_model=User)
def get_user(us_id: int, current_user: User = Depends(get_current_user)):
    if us_id != current_user.us_id:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        row = fetch_user(cursor, us_id)
        cursor.close()
        if row is None:
            raise HTTPException(status_code=404, detail=NOT_FOUND)
        return row
    finally:
        conn.close()


@router.post("/", response_model=User, status_code=201)
def create_user(user: UserIn, current_user: User = Depends(get_current_user)):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        check_email_free(cursor, user.us_email)
        cursor.execute(
            "INSERT INTO users (us_name, us_email) VALUES (%s, %s)", (user.us_name, user.us_email)
        )
        conn.commit()
        # On relit la ligne pour renvoyer aussi us_id et us_created_at
        row = fetch_user(cursor, cursor.lastrowid)
        cursor.close()
        return row
    finally:
        conn.close()


@router.put("/{us_id}", response_model=User)
def update_user(
    us_id: int,
    user: UserIn,
    current_user: User = Depends(get_current_user),
):
    if us_id != current_user.us_id:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        if fetch_user(cursor, us_id) is None:
            raise HTTPException(status_code=404, detail=NOT_FOUND)
        check_email_free(cursor, user.us_email, exclude_id=us_id)
        cursor.execute(
            "UPDATE users SET us_name = %s, us_email = %s WHERE us_id = %s",
            (user.us_name, user.us_email, us_id),
        )
        conn.commit()
        row = fetch_user(cursor, us_id)
        cursor.close()
        return row
    finally:
        conn.close()


@router.delete("/{us_id}", status_code=204)
def delete_user(us_id: int, current_user: User = Depends(get_current_user)):
    """⚠️ Supprime aussi toutes ses dépenses et tous ses revenus (ON DELETE CASCADE)."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if us_id != current_user.us_id or not row_exists(cursor, "users", "us_id", us_id):
            raise HTTPException(status_code=404, detail=NOT_FOUND)
        cursor.execute("DELETE FROM users WHERE us_id = %s", (us_id,))
        conn.commit()
        cursor.close()
    finally:
        conn.close()


@router.get("/{us_id}/summary", response_model=Summary)
def get_summary(
    us_id: int,
    month: Optional[str] = Query(default=None, pattern=MONTH_PATTERN),
    current_user: User = Depends(get_current_user),
):
    """Tableau de bord d'un utilisateur : revenus, dépenses, solde (sur un mois si ?month=2026-10)."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        if us_id != current_user.us_id or not row_exists(cursor, "users", "us_id", us_id):
            raise HTTPException(status_code=404, detail=NOT_FOUND)

        inc_sql, inc_params = month_filter("inc_date", month)
        cursor.execute(
            f"SELECT inc_amount AS amount FROM incomes WHERE user_id = %s{inc_sql}",
            [us_id] + inc_params,
        )
        incomes = cursor.fetchall()

        ex_sql, ex_params = month_filter("e.ex_date", month)
        cursor.execute(
            "SELECT e.ex_amount AS amount, c.cat_name AS category FROM expenses e "
            f"LEFT JOIN categories c ON c.cat_id = e.categorie_id WHERE e.user_id = %s{ex_sql}",
            [us_id] + ex_params,
        )
        expenses = cursor.fetchall()
        cursor.close()
        return compute_summary(incomes, expenses)
    finally:
        conn.close()
