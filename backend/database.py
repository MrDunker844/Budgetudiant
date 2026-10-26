import os

import mysql.connector
from dotenv import load_dotenv

# Charge les variables du fichier .env (jamais d'identifiants en dur)
load_dotenv()


def get_connection():
    """Ouvre une connexion MySQL avec les infos du .env."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "budget_etudiant"),
    )
