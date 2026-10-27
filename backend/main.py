from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection
from routers import expenses, incomes, users

app = FastAPI(title="Budget Étudiant API")

# Autorise le front React (Vite tourne sur le port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(incomes.router)
# À venir : app.include_router(categories.router)


@app.get("/api/health")
def health():
    """Vérifie que l'API tourne, que MySQL répond et que les tables existent."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM expenses")
        nb_expenses = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM incomes")
        nb_incomes = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return {"api": "ok", "database": "ok", "expenses": nb_expenses, "incomes": nb_incomes}
    except Exception as e:
        return {"api": "ok", "database": f"erreur : {e}"}
