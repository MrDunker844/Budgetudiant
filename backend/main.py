from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection

app = FastAPI(title="Budget Étudiant API")

# Autorise le front React (Vite tourne sur le port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Les routers seront ajoutés ici, par ex. :
# from routers import transactions, categories
# app.include_router(transactions.router)
# app.include_router(categories.router)


@app.get("/api/health")
def health():
    """Vérifie que l'API tourne et que MySQL répond."""
    try:
        conn = get_connection()
        conn.close()
        db = "ok"
    except Exception as e:
        db = f"erreur : {e}"
    return {"api": "ok", "database": db}
