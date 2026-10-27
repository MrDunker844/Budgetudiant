# Budget Étudiant

Application de gestion de budget étudiant : frontend React (Vite), backend FastAPI, base de données MySQL.

```
├── frontend/            # React + JavaScript
├── backend/             # Python + FastAPI (+ Dockerfile)
├── database/            # script SQL (tables + données de test)
└── docker-compose.yml   # lance MySQL + l'API
```

---

## Démarrage rapide avec Docker (recommandé)

Docker lance **deux conteneurs** identiques sur tous les PC (Windows, Mac, Linux) :

| Conteneur | Rôle | Adresse |
|---|---|---|
| `budget-mysql` | Base MySQL 8.4 | `localhost:3306` |
| `budget-api` | API FastAPI | http://localhost:8000 |

Prérequis : [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé.

```bash
# 1. Créer le fichier d'identifiants (une seule fois)
copy backend\.env.example backend\.env      # Windows
cp backend/.env.example backend/.env        # Mac / Linux

# 2. Générer un secret unique avec `openssl rand -hex 32`, puis renseigner
#    la valeur obtenue dans AUTH_SECRET dans backend/.env
openssl rand -hex 32

# 3. Lancer MySQL + l'API
docker compose --env-file backend/.env up -d --build
```

Au premier lancement, Docker télécharge les images, installe les dépendances Python et exécute `database/schema.sql`. L'API attend que MySQL soit prête avant de démarrer.

Vérifier :

- http://localhost:8000/api/health → `{ "api": "ok", "database": "ok", "expenses": 8, "incomes": 5 }`
- http://localhost:8000/docs → documentation interactive de l'API (Swagger)

Puis lancer le frontend (hors Docker) :

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

---

## Base de données MySQL

Chaque membre a sa propre base **en local**. Le script `database/schema.sql` est versionné : il crée la base `budget_etudiant`, les tables `users`, `categories`, `expenses` et `incomes`, et insère des données de test (voir le schéma dans [backend/back.md](backend/back.md)).

### Identifiants

Les identifiants ne sont jamais écrits dans le code : ils sont lus dans `backend/.env` (fichier non versionné, voir `backend/.env.example`).

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=budget
DB_NAME=budget_etudiant
```

> Dans Docker, l'API utilise automatiquement `DB_HOST=db` (le nom du service MySQL dans `docker-compose.yml`). `localhost` sert seulement si on lance l'API hors Docker.

### Option A — Docker

Lancée avec la commande du démarrage rapide. Pour ne lancer **que** la base :

```bash
docker compose --env-file backend/.env up -d db
```

### Option B — XAMPP (si Docker n'est pas disponible)

1. Installer [XAMPP](https://www.apachefriends.org/) et démarrer **MySQL** dans le XAMPP Control Panel.
2. Importer le script :
   - via phpMyAdmin (http://localhost/phpmyadmin) → onglet **Importer** → `database/schema.sql`
   - ou en ligne de commande (cmd) :
     ```bash
     C:\xampp\mysql\bin\mysql.exe -u root -p < database\schema.sql
     ```
3. Dans `backend/.env`, mettre `DB_PASSWORD=` (vide par défaut avec XAMPP).
4. Lancer l'API hors Docker (voir plus bas).

> Après une modification de `schema.sql`, relancer simplement l'import : le script supprime et recrée les tables (les données locales sont effacées).

---

## API FastAPI

### Dans Docker

Le code de `backend/` est **monté dans le conteneur** et l'API tourne avec `--reload` : quand on modifie un fichier Python, l'API redémarre toute seule, pas besoin de reconstruire.

Il faut reconstruire l'image (`--build`) seulement si on modifie `requirements.txt` ou le `Dockerfile` :

```bash
docker compose --env-file backend/.env up -d --build api
```

### Hors Docker (avec un venv)

```bash
cd backend
python -m venv venv
venv\Scripts\activate           # Windows  (Mac/Linux : source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload       # → http://localhost:8000
```

> Ne pas lancer les deux en même temps : le port 8000 serait déjà pris.

### Routes disponibles

| Ressource | Routes | Remarques |
|---|---|---|
| Santé | `GET /api/health` | Vérifie l'API et MySQL |
| Utilisateurs | `GET /api/users/` · `GET /api/users/{id}` · `POST /api/users/` · `PUT /api/users/{id}` · `DELETE /api/users/{id}` | E-mail unique (`409` sinon). ⚠️ Supprimer un utilisateur supprime ses dépenses et revenus |
| Tableau de bord | `GET /api/users/{id}/summary` | Total revenus, total dépenses, solde, dépenses par catégorie. Filtre facultatif `?month=2026-10` |
| Dépenses | `GET /api/expenses/` · `GET /api/expenses/{id}` · `POST /api/expenses/` · `PUT /api/expenses/{id}` · `DELETE /api/expenses/{id}` | Filtres facultatifs sur la liste : `?user_id=1&month=2026-10` |
| Revenus | `GET /api/incomes/` · `GET /api/incomes/{id}` · `POST /api/incomes/` · `PUT /api/incomes/{id}` · `DELETE /api/incomes/{id}` | Mêmes filtres que les dépenses |

📖 Détail de chaque route (champs, exemples, erreurs, utilisation depuis React) : **[backend/API.md](backend/API.md)**.

Codes de réponse : `201` création, `204` suppression, `404` id introuvable, `400` `user_id` ou `categorie_id` inexistant, `422` données invalides (montant ≤ 0, titre vide, e-mail mal formé, mois au mauvais format…).

### Tests automatiques

Les tests (`backend/tests/`) utilisent `pytest` et une fausse base de données : **pas besoin de MySQL ni de Docker** pour les lancer.

```bash
cd backend
venv\Scripts\activate           # Windows  (Mac/Linux : source venv/bin/activate)
pip install -r requirement.txt
pytest                          # ou pytest -v pour voir le détail de chaque test
```

Dans Docker (après un `up -d --build` pour installer `pytest` dans l'image) :

```bash
docker compose exec api pytest
```

---

## Commandes Docker utiles

| Action | Commande |
|---|---|
| Lancer MySQL + API | `docker compose --env-file backend/.env up -d --build` |
| Voir les conteneurs | `docker ps` |
| Logs de l'API (erreurs Python) | `docker compose logs -f api` |
| Logs de MySQL | `docker compose logs -f db` |
| Redémarrer l'API | `docker compose restart api` |
| Arrêter tout | `docker compose stop` |
| Console SQL | `docker exec -it budget-mysql mysql -uroot -p budget_etudiant` |
| Réinitialiser la base (après modif de `schema.sql`) | `docker compose down -v` puis relancer |

> ⚠️ `docker compose down -v` **supprime toutes les données locales** de la base. Le script remet ensuite les données de test.

---

## Intégration continue (GitHub Actions)

Le fichier `.github/workflows/ci.yml` lance automatiquement des vérifications **à chaque push sur `main` et à chaque Pull Request vers `main`**.

| Job | Ce qu'il vérifie |
|---|---|
| **Backend** | Installe les dépendances, vérifie la syntaxe Python, lance les tests `pytest`, démarre un vrai MySQL, importe `database/schema.sql`, lance l'API et appelle `/api/health` (doit renvoyer `database: ok`, des dépenses et des revenus) |
| **Frontend** | `npm ci`, `npm run lint` (oxlint), `npm run build` (Vite) |
| **Docker** | Vérifie `docker-compose.yml` et construit l'image de l'API |

Les 3 jobs tournent en parallèle sur des machines Ubuntu fournies par GitHub.

### Voir le résultat

- Onglet **Actions** du dépôt GitHub → cliquer sur l'exécution → cliquer sur un job pour voir le détail de chaque étape.
- Dans une Pull Request, le statut apparaît en bas : ✅ tout passe, ❌ un job a échoué.
- **Règle d'équipe : on ne merge pas une PR tant que la CI n'est pas verte.**

### Si la CI échoue

1. Ouvrir le job en rouge, puis l'étape en rouge : le message d'erreur est dedans.
2. Reproduire en local avec la même commande (`npm run lint`, `npm run build`, `docker compose build api`…).
3. Corriger, commit, push sur la même branche : la CI se relance toute seule sur la PR.

En cas d'échec du job Backend, la dernière étape affiche les logs d'uvicorn.

### Bloquer le merge si la CI échoue (optionnel)

Sur GitHub : **Settings → Branches → Add branch ruleset** (ou *Branch protection rule*) pour `main` → cocher **Require status checks to pass** et sélectionner les jobs `Backend`, `Frontend`, `Docker`.

> Le mot de passe MySQL de la CI est celui d'une base jetable, détruite à la fin du job. Pour ne pas l'écrire dans le fichier, on peut créer un secret `CI_DB_PASSWORD` dans **Settings → Secrets and variables → Actions** : le workflow l'utilise automatiquement s'il existe.

---

## Problèmes fréquents

- **Port 3306 déjà utilisé** (un autre MySQL est installé) : mettre `DB_PORT=3307` dans `backend/.env`, puis relancer. L'API dans Docker n'est pas impactée.
- **Port 8000 déjà utilisé** : une API tourne déjà hors Docker, l'arrêter (Ctrl+C).
- **`/api/health` renvoie une erreur de base** : regarder `docker compose logs db`. Au tout premier lancement, MySQL peut mettre 20–30 s à s'initialiser.
- **`Access denied for user 'root'`** : le mot de passe de `backend/.env` ne correspond pas à celui de la base. Avec Docker, le mot de passe est fixé au premier lancement : pour le changer, faire `docker compose down -v` puis relancer.
- **Nouvelle dépendance Python non trouvée** (`ModuleNotFoundError`) : l'ajouter dans `requirements.txt` puis relancer avec `--build`.
- **Accents mal affichés** : vérifier que le script commence bien par `SET NAMES utf8mb4;`.
