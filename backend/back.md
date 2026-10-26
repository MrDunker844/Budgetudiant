# Backend — guide de dev et de debug

API **FastAPI** (Python) connectée à **MySQL**. Ce fichier résume ce qu'il faut savoir pour développer et déboguer le back.
L'installation complète (Docker, XAMPP) est dans le [README](../README.md).

---

## 1. Organisation des fichiers

```
backend/
├── main.py            # crée l'app FastAPI, configure CORS, inclut les routers, route /api/health
├── database.py        # get_connection() : connexion MySQL avec les infos du .env
├── models.py          # schémas Pydantic (validation des données reçues / renvoyées)
├── routers/           # un fichier par ressource : transactions.py, categories.py…
├── requirements.txt   # dépendances Python
├── Dockerfile         # image Docker de l'API
├── .env.example       # modèle d'identifiants (à copier en .env)
└── .env               # VOS identifiants — jamais commité
```

Base de données : `budget_etudiant`, tables `categories (id, name)` et
`transactions (id, amount, type, date, description, category_id)`. Script : `database/schema.sql`.

---

## 2. Lancer l'API

**Avec Docker (recommandé)** — depuis la racine du projet, Docker Desktop lancé :

```bash
docker compose --env-file backend/.env up -d --build
```

**Sans Docker** (base via XAMPP) :

```bash
cd backend
python -m venv venv
venv\Scripts\activate           # Mac/Linux : source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

| URL | Utilité |
|---|---|
| http://localhost:8000/api/health | Vérifie API + MySQL + tables |
| http://localhost:8000/docs | Swagger : tester toutes les routes à la main |

Le code est rechargé automatiquement à chaque sauvegarde (`--reload`), dans Docker comme en local.

---

## 3. Variables d'environnement (`backend/.env`)

| Variable | Valeur par défaut | Remarque |
|---|---|---|
| `DB_HOST` | `localhost` | Forcé à `db` dans Docker (nom du service MySQL) |
| `DB_PORT` | `3306` | Mettre `3307` si le port est déjà pris |
| `DB_USER` | `root` | |
| `DB_PASSWORD` | `budget` | Vide avec XAMPP |
| `DB_NAME` | `budget_etudiant` | |

> ❌ Jamais d'identifiant MySQL écrit dans le code : toujours passer par `get_connection()`.

---

## 4. Ajouter un router (modèle à copier)

Exemple : `backend/routers/categories.py`

```python
from fastapi import APIRouter, HTTPException

from database import get_connection
from models import Category, CategoryIn

router = APIRouter(prefix="/api/categories", tags=["Catégories"])


@router.get("/", response_model=list[Category])
def list_categories():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)   # renvoie des dict {"id": 1, "name": ...}
    cursor.execute("SELECT id, name FROM categories ORDER BY name")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


@router.post("/", response_model=Category, status_code=201)
def create_category(category: CategoryIn):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO categories (name) VALUES (%s)", (category.name,))
    conn.commit()                           # obligatoire pour INSERT / UPDATE / DELETE
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"id": new_id, "name": category.name}


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
    conn.commit()
    deleted = cursor.rowcount
    cursor.close()
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
```

Puis l'inclure dans `main.py` :

```python
from routers import categories
app.include_router(categories.router)
```

### Règles à respecter

- **Toujours des requêtes paramétrées** : `"... WHERE id = %s", (id,)`. Jamais de f-string dans le SQL (injection SQL).
- **`conn.commit()`** après chaque `INSERT`, `UPDATE`, `DELETE`, sinon rien n'est enregistré.
- **`cursor(dictionary=True)`** pour les `SELECT` : FastAPI renvoie directement des objets JSON.
- **Fermer** le curseur et la connexion à la fin de chaque route.
- Toutes les routes commencent par **`/api/...`** et utilisent les schémas de `models.py`.
- Codes HTTP : `200` lecture, `201` création, `204` suppression, `404` introuvable, `422` données invalides (géré automatiquement par Pydantic).

---

## 5. Tester

1. Ouvrir http://localhost:8000/docs
2. Choisir une route → **Try it out** → remplir → **Execute**
3. Vérifier le code HTTP et la réponse
4. Contrôler en base si besoin :

```bash
docker exec -it budget-mysql mysql -uroot -p budget_etudiant
```
```sql
SELECT * FROM transactions;
```

Avant chaque Pull Request : tester **toutes** les routes modifiées dans `/docs`.

---

## 6. Debug

### Où regarder

| Problème | Commande |
|---|---|
| Erreur Python, route qui plante (500) | `docker compose logs -f api` |
| Erreur MySQL | `docker compose logs -f db` |
| Les conteneurs tournent ? | `docker ps` |
| Redémarrer l'API | `docker compose restart api` |

Sans Docker, les erreurs s'affichent directement dans le terminal où tourne `uvicorn`.
Astuce : un `print(...)` dans une route apparaît dans ces logs.

### Erreurs fréquentes

| Erreur | Cause | Solution |
|---|---|---|
| `failed to connect to the docker API ... dockerDesktopLinuxEngine` | Docker Desktop n'est pas lancé | Ouvrir Docker Desktop, attendre « Engine running » |
| `Can't connect to MySQL server` | MySQL pas démarrée / encore en initialisation | Attendre 30 s, vérifier `docker ps` et `docker compose logs db` |
| `Access denied for user 'root'` | Mauvais mot de passe dans `.env` | Corriger `.env` ; avec Docker : `docker compose down -v` puis relancer (⚠️ efface la base) |
| `Unknown database 'budget_etudiant'` / `Table ... doesn't exist` | Script SQL pas importé | Docker : `docker compose down -v` puis relancer ; XAMPP : réimporter `schema.sql` |
| `ModuleNotFoundError` | Dépendance manquante | L'ajouter à `requirements.txt` puis relancer avec `--build` |
| `422 Unprocessable Entity` | Le JSON envoyé ne correspond pas au schéma Pydantic | Lire le `detail` de la réponse : il indique le champ en cause |
| Erreur **CORS** dans la console du navigateur | Front pas sur `http://localhost:5173` | Vérifier l'URL du front ou ajouter l'origine dans `allow_origins` (`main.py`) |
| Route en **404** alors qu'elle existe | Router pas inclus dans `main.py` ou mauvais préfixe | Vérifier `app.include_router(...)` et le `prefix` |
| `address already in use` / port 8000 pris | Une autre API tourne déjà | Arrêter l'uvicorn local (Ctrl+C) ou le conteneur |
| Modification de `schema.sql` ignorée | Docker n'exécute le script qu'au premier lancement | `docker compose down -v` puis relancer (⚠️ efface la base) |

---

## 7. Git côté back

- Une branche par fonctionnalité : `feature/crud-transactions`, `feature/crud-categories`…
- Commits courts en français à l'impératif : `Ajoute la route POST /api/transactions`
- Si vous modifiez la structure de la base : mettre à jour `database/schema.sql` **et** `models.py` dans la même PR, et prévenir l'équipe (chacun doit réinitialiser sa base).
- Jamais commiter : `.env`, `venv/`, `__pycache__/` (déjà dans le `.gitignore`).
