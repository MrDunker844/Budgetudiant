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

# 2. Lancer MySQL + l'API
docker compose --env-file backend/.env up -d --build
```

Au premier lancement, Docker télécharge les images, installe les dépendances Python et exécute `database/schema.sql`. L'API attend que MySQL soit prête avant de démarrer.

Vérifier :

- http://localhost:8000/api/health → `{ "api": "ok", "database": "ok" }`
- http://localhost:8000/docs → documentation interactive de l'API (Swagger)

Puis lancer le frontend (hors Docker) :

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

---

## Base de données MySQL

Chaque membre a sa propre base **en local**. Le script `database/schema.sql` est versionné : il crée la base `budget_etudiant`, les tables `categories` et `transactions`, et insère des données de test.

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

## Problèmes fréquents

- **Port 3306 déjà utilisé** (un autre MySQL est installé) : mettre `DB_PORT=3307` dans `backend/.env`, puis relancer. L'API dans Docker n'est pas impactée.
- **Port 8000 déjà utilisé** : une API tourne déjà hors Docker, l'arrêter (Ctrl+C).
- **`/api/health` renvoie une erreur de base** : regarder `docker compose logs db`. Au tout premier lancement, MySQL peut mettre 20–30 s à s'initialiser.
- **`Access denied for user 'root'`** : le mot de passe de `backend/.env` ne correspond pas à celui de la base. Avec Docker, le mot de passe est fixé au premier lancement : pour le changer, faire `docker compose down -v` puis relancer.
- **Nouvelle dépendance Python non trouvée** (`ModuleNotFoundError`) : l'ajouter dans `requirements.txt` puis relancer avec `--build`.
- **Accents mal affichés** : vérifier que le script commence bien par `SET NAMES utf8mb4;`.
