from fastapi import APIRouter

from database import get_connection
from models import Category

router = APIRouter(prefix="/api/categories", tags=["Catégories"])


@router.get("/", response_model=list[Category])
def list_categories():
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categories ORDER BY cat_name")
        rows = cursor.fetchall()
        cursor.close()
        return rows
    finally:
        conn.close()
