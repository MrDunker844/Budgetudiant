from fastapi import APIRouter

from database import get_connection
from models import Category

router = APIRouter(prefix="/api/categories", tags=["Catégories"])


@router.get("/", response_model=list[Category])
def list_categories():
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT cat_id, cat_name, cat_color, cat_description, cat_created_at "
            "FROM categories ORDER BY cat_name"
        )
        rows = cursor.fetchall()
        cursor.close()
        return rows
    finally:
        conn.close()
