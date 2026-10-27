# Documentation de l'API — Budget Étudiant

Référence complète des routes de l'API FastAPI : ce qu'on envoie, ce qu'on reçoit, les erreurs possibles.

- Installation et lancement : voir le [README](../README.md).
- Organisation du code, règles de dev et debug : voir [back.md](back.md).
- Documentation interactive (pour tester à la main) : http://localhost:8000/docs

---

## Sommaire

1. [Généralités](#1-généralités)
2. [Santé](#2-santé)
3. [Utilisateurs](#3-utilisateurs)
4. [Tableau de bord d'un utilisateur](#4-tableau-de-bord-dun-utilisateur)
5. [Dépenses](#5-dépenses)
6. [Revenus](#6-revenus)
7. [Erreurs](#7-erreurs)
8. [Utilisation depuis le front React](#8-utilisation-depuis-le-front-react)
9. [Données de test](#9-données-de-test)
10. [Organisation du code](#10-organisation-du-code)

---

## 1. Généralités

| Élément | Valeur |
|---|---|
| Adresse de base | `http://localhost:8000` |
| Format | JSON (`Content-Type: application/json`) |
| Authentification | Aucune pour l'instant : n'importe qui peut lire et modifier toutes les données |
| CORS | Seul le front `http://localhost:5173` est autorisé (voir `main.py`) |

### Formats des valeurs

| Type | Format | Exemple |
|---|---|---|
| Date | `AAAA-MM-JJ` | `"2026-10-02"` |
| Date et heure | ISO 8601 | `"2026-10-27T10:00:00"` |
| Mois (filtre) | `AAAA-MM` | `2026-10` |
| Montant | nombre, 2 décimales max, **toujours > 0** | `380.0` |

> Les montants sont toujours positifs : on sait si c'est de l'argent qui entre ou qui sort selon la table (`incomes` = revenu, `expenses` = dépense).

### Slash final

Les routes de liste et de création se terminent par `/` : `GET /api/expenses/`, `POST /api/expenses/`.
Sans le `/`, FastAPI répond par une redirection `307`, qui peut poser problème au navigateur (CORS). **Toujours mettre le `/` final.**

### Codes de réponse utilisés

| Code | Signification | Quand |
|---|---|---|
| `200` | OK | Lecture ou modification réussie |
| `201` | Created | Création réussie (la réponse contient l'objet créé) |
| `204` | No Content | Suppression réussie (réponse vide) |
| `400` | Bad Request | `user_id` ou `categorie_id` qui n'existe pas |
| `404` | Not Found | L'id dans l'URL n'existe pas |
| `409` | Conflict | E-mail déjà utilisé par un autre utilisateur |
| `422` | Unprocessable Entity | Données invalides (champ manquant, mauvais type, montant ≤ 0…) |
| `500` | Internal Server Error | Bug ou base injoignable : regarder `docker compose logs -f api` |

---

## 2. Santé

### `GET /api/health`

Vérifie que l'API tourne, que MySQL répond et que les tables existent.

**Réponse `200`**

```json
{ "api": "ok", "database": "ok", "expenses": 8, "incomes": 5 }
```

Si la base ne répond pas, la route répond quand même `200`, avec le message d'erreur :

```json
{ "api": "ok", "database": "erreur : 2003 (HY000): Can't connect to MySQL server on 'db:3306'" }
```

---

## 3. Utilisateurs

### L'objet `User`

| Champ | Type | Envoyé | Renvoyé | Règles |
|---|---|---|---|---|
| `us_id` | entier | non | oui | Créé par MySQL |
| `us_name` | texte | **oui** | oui | 1 à 100 caractères |
| `us_email` | texte | **oui** | oui | E-mail valide, **unique** |
| `us_monthly_budget` | nombre | non | oui | Budget mensuel disponible, strictement positif ou `null` |
| `us_created_at` | date et heure | non | oui | Rempli par MySQL |

### `GET /api/users/` — lister les utilisateurs

Triés par nom.

**Réponse `200`**

```json
[
  { "us_id": 1, "us_name": "Alice Martin", "us_email": "alice@example.com", "us_monthly_budget": 950.0, "us_created_at": "2026-10-27T10:00:00" },
  { "us_id": 2, "us_name": "Bob Durand", "us_email": "bob@example.com", "us_monthly_budget": null, "us_created_at": "2026-10-27T10:00:00" }
]
```

### `GET /api/users/{us_id}` — lire un utilisateur

**Réponse `200`** : un objet `User`.
**Erreur** : `404` si l'utilisateur n'existe pas.

### `POST /api/users/` — créer un utilisateur

**Corps de la requête**

```json
{ "us_name": "Chloé Petit", "us_email": "chloe@example.com", "us_monthly_budget": 850 }
```

**Réponse `201`** : l'utilisateur créé, avec `us_id` et `us_created_at`.

**Erreurs**

| Code | Cause |
|---|---|
| `409` | `"E-mail déjà utilisé"` |
| `422` | Nom vide ou trop long, e-mail mal formé, champ manquant |

### `PUT /api/users/{us_id}` — modifier un utilisateur

Remplace le nom, l'e-mail et le budget mensuel : il faut envoyer le nom et l'e-mail, même si un seul change.
On peut garder son propre e-mail (il n'est en conflit qu'avec les **autres** utilisateurs).

**Corps** : comme pour `POST`. Le budget est affiché séparément du solde revenus moins dépenses.
**Réponse `200`** : l'utilisateur modifié.

**Erreurs** : `404` utilisateur introuvable, `409` e-mail pris par un autre, `422` données invalides.

### `DELETE /api/users/{us_id}` — supprimer un utilisateur

> ⚠️ **Supprime aussi toutes ses dépenses et tous ses revenus** (`ON DELETE CASCADE` dans `schema.sql`). Il n'y a pas de retour en arrière : côté front, demander une confirmation.

**Réponse `204`** : vide.
**Erreur** : `404` si l'utilisateur n'existe pas.

---

## 4. Tableau de bord d'un utilisateur

### `GET /api/users/{us_id}/summary` — résumé du budget

Calcule le total des revenus, le total des dépenses, le solde et la répartition des dépenses par catégorie.

| Paramètre (URL) | Obligatoire | Exemple | Effet |
|---|---|---|---|
| `month` | non | `?month=2026-10` | Ne compte que ce mois-là. Sans ce paramètre : toutes les dates |

**Exemple** : `GET /api/users/1/summary?month=2026-10` avec les données de test

```json
{
  "total_revenus": 950.0,
  "total_depenses": 529.9,
  "solde": 420.1,
  "depenses_par_categorie": [
    { "category": "Logement", "total": 380.0 },
    { "category": "Alimentation", "total": 65.4 },
    { "category": "Études", "total": 42.0 },
    { "category": "Transport", "total": 30.0 },
    { "category": "Loisirs", "total": 12.5 }
  ]
}
```

| Champ | Explication |
|---|---|
| `total_revenus` | Somme des `inc_amount` de l'utilisateur |
| `total_depenses` | Somme des `ex_amount` de l'utilisateur |
| `solde` | `total_revenus − total_depenses` (peut être négatif) |
| `depenses_par_categorie` | Une ligne par catégorie, **de la plus grosse à la plus petite**. `"category": null` = dépenses sans catégorie. Pratique pour un graphique camembert |

Un utilisateur sans aucune transaction obtient des totaux à `0` et une liste vide.

**Erreurs** : `404` utilisateur introuvable, `422` mois au mauvais format (ex. `2026-13`, `10-2026`).

---

## 5. Dépenses

### L'objet `Expense`

| Champ | Type | Envoyé | Renvoyé | Règles |
|---|---|---|---|---|
| `ex_id` | entier | non | oui | Créé par MySQL |
| `user_id` | entier | **oui** | oui | Doit exister dans `users` |
| `categorie_id` | entier ou `null` | non (défaut `null`) | oui | Si donné, doit exister dans `categories` |
| `ex_title` | texte | **oui** | oui | 1 à 100 caractères |
| `ex_amount` | nombre | **oui** | oui | Strictement > 0 |
| `ex_date` | date | **oui** | oui | `AAAA-MM-JJ` |
| `ex_description` | texte ou `null` | non (défaut `null`) | oui | 255 caractères max |
| `ex_created_at` | date et heure | non | oui | Rempli par MySQL |

### `GET /api/expenses/` — lister les dépenses

Triées de la plus récente à la plus ancienne.

| Paramètre (URL) | Obligatoire | Exemple | Effet |
|---|---|---|---|
| `user_id` | non | `?user_id=1` | Seulement les dépenses de cet utilisateur |
| `month` | non | `?month=2026-10` | Seulement ce mois-là |

Les filtres se combinent : `GET /api/expenses/?user_id=1&month=2026-10`.

> Sans `user_id`, la route renvoie les dépenses de **tous** les utilisateurs. Côté front, toujours filtrer par l'utilisateur affiché.

**Réponse `200`**

```json
[
  {
    "ex_id": 1,
    "user_id": 1,
    "categorie_id": 2,
    "ex_title": "Loyer octobre",
    "ex_amount": 380.0,
    "ex_date": "2026-10-02",
    "ex_description": "Studio CROUS",
    "ex_created_at": "2026-10-27T10:00:00"
  }
]
```

**Erreur** : `422` si `month` ou `user_id` est mal formé.

### `GET /api/expenses/{ex_id}` — lire une dépense

**Réponse `200`** : un objet `Expense`. **Erreur** : `404` (`"Dépense introuvable"`).

### `POST /api/expenses/` — créer une dépense

**Corps de la requête** (seuls `user_id`, `ex_title`, `ex_amount`, `ex_date` sont obligatoires)

```json
{
  "user_id": 1,
  "categorie_id": 1,
  "ex_title": "Courses Carrefour",
  "ex_amount": 42.3,
  "ex_date": "2026-10-27",
  "ex_description": "Semaine 44"
}
```

**Réponse `201`** : la dépense créée, avec `ex_id` et `ex_created_at`.

**Erreurs**

| Code | Cause |
|---|---|
| `400` | `"Utilisateur introuvable"` ou `"Catégorie introuvable"` |
| `422` | Montant ≤ 0, titre vide, date invalide, champ obligatoire manquant |

### `PUT /api/expenses/{ex_id}` — modifier une dépense

Remplace **tous** les champs : envoyer l'objet complet (comme pour `POST`), pas seulement le champ modifié.
Un champ facultatif non envoyé (`categorie_id`, `ex_description`) est remis à `null`.

**Réponse `200`** : la dépense modifiée.
**Erreurs** : `404` dépense introuvable, `400` utilisateur ou catégorie introuvable, `422` données invalides.

### `DELETE /api/expenses/{ex_id}` — supprimer une dépense

**Réponse `204`** : vide. **Erreur** : `404`.

---

## 6. Revenus

Les revenus fonctionnent **exactement comme les dépenses** (même code, voir `routers/common.py`).
Seuls l'adresse et le préfixe des champs changent : `/api/incomes/` et `inc_` au lieu de `/api/expenses/` et `ex_`.

### L'objet `Income`

| Champ | Type | Envoyé | Renvoyé | Règles |
|---|---|---|---|---|
| `inc_id` | entier | non | oui | Créé par MySQL |
| `user_id` | entier | **oui** | oui | Doit exister dans `users` |
| `categorie_id` | entier ou `null` | non (défaut `null`) | oui | Si donné, doit exister dans `categories` |
| `inc_title` | texte | **oui** | oui | 1 à 100 caractères |
| `inc_amount` | nombre | **oui** | oui | Strictement > 0 |
| `inc_date` | date | **oui** | oui | `AAAA-MM-JJ` |
| `inc_description` | texte ou `null` | non (défaut `null`) | oui | 255 caractères max |
| `inc_created_at` | date et heure | non | oui | Rempli par MySQL |

### Routes

| Méthode | Route | Réponse | Erreurs |
|---|---|---|---|
| `GET` | `/api/incomes/` (filtres `?user_id=` et `?month=`) | `200` liste triée du plus récent au plus ancien | `422` |
| `GET` | `/api/incomes/{inc_id}` | `200` un revenu | `404` |
| `POST` | `/api/incomes/` | `201` le revenu créé | `400`, `422` |
| `PUT` | `/api/incomes/{inc_id}` | `200` le revenu modifié | `404`, `400`, `422` |
| `DELETE` | `/api/incomes/{inc_id}` | `204` vide | `404` |

**Exemple de création**

```json
{
  "user_id": 1,
  "categorie_id": 7,
  "inc_title": "Bourse novembre",
  "inc_amount": 450.0,
  "inc_date": "2026-11-05",
  "inc_description": "Échelon 4"
}
```

---

## 7. Erreurs

### Erreurs envoyées par nos routes (`400`, `404`, `409`)

Un objet avec un message en français dans `detail` :

```json
{ "detail": "Catégorie introuvable" }
```

| Message | Code |
|---|---|
| `Utilisateur introuvable` | `404` (id dans l'URL) ou `400` (`user_id` dans le corps) |
| `Dépense introuvable` / `Revenu introuvable` | `404` |
| `Catégorie introuvable` | `400` |
| `E-mail déjà utilisé` | `409` |

### Erreurs de validation (`422`)

Générées automatiquement par Pydantic à partir de `models.py`. `detail` est une **liste** : une entrée par champ en erreur.
`loc` indique où est le problème (`body` = corps JSON, `query` = paramètre d'URL) et quel champ.

```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "ex_amount"],
      "msg": "Input should be greater than 0",
      "input": -5,
      "ctx": { "gt": 0.0 }
    }
  ]
}
```

> Les messages `msg` sont en anglais. Pour afficher un message à l'utilisateur, le front peut se baser sur `loc[1]` (le nom du champ) et écrire son propre texte.

---

## 8. Utilisation depuis le front React

Le front a déjà un helper dans `frontend/src/services/api.js` : `request(path, options)` ajoute l'adresse de l'API, envoie du JSON et lève une erreur si le code n'est pas 2xx.

```js
import { request } from "./api";

// Lister les dépenses d'octobre de l'utilisateur 1
const expenses = await request("/api/expenses/?user_id=1&month=2026-10");

// Créer une dépense
const created = await request("/api/expenses/", {
  method: "POST",
  body: JSON.stringify({
    user_id: 1,
    categorie_id: 1,
    ex_title: "Courses",
    ex_amount: 42.3,
    ex_date: "2026-10-27",
  }),
});

// Modifier (envoyer l'objet complet)
await request(`/api/expenses/${created.ex_id}`, {
  method: "PUT",
  body: JSON.stringify({ ...created, ex_amount: 45 }),
});

// Supprimer (renvoie null : code 204)
await request(`/api/expenses/${created.ex_id}`, { method: "DELETE" });

// Tableau de bord
const summary = await request("/api/users/1/summary?month=2026-10");
console.log(summary.solde);
```

> Pour `PUT`, envoyer `{ ...created, ... }` fonctionne : les champs en trop (`ex_id`, `ex_created_at`) sont ignorés par l'API.

---

## 9. Données de test

Insérées par `database/schema.sql` (réinitialiser avec `docker compose down -v` puis relancer).

**Utilisateurs**

| `us_id` | Nom | E-mail |
|---|---|---|
| 1 | Alice Martin | alice@example.com |
| 2 | Bob Durand | bob@example.com |

**Catégories** (communes aux dépenses et aux revenus ; pas encore de route `/api/categories`)

| `cat_id` | Nom | Couleur | Usage habituel |
|---|---|---|---|
| 1 | Alimentation | `#4CAF50` | Dépense |
| 2 | Logement | `#2196F3` | Dépense |
| 3 | Transport | `#FF9800` | Dépense |
| 4 | Loisirs | `#9C27B0` | Dépense |
| 5 | Études | `#795548` | Dépense |
| 6 | Santé | `#F44336` | Dépense |
| 7 | Bourse | `#009688` | Revenu |
| 8 | Job étudiant | `#3F51B5` | Revenu |
| 9 | Aides | `#00BCD4` | Revenu |

**Transactions** : 8 dépenses et 5 revenus en octobre 2026 (5 dépenses et 3 revenus pour Alice, 3 dépenses et 2 revenus pour Bob).

---

## 10. Organisation du code

```
backend/
├── main.py              # crée l'app, CORS, inclut les routers, /api/health
├── models.py            # schémas Pydantic : règles de validation de chaque champ
├── database.py          # get_connection() : connexion MySQL
├── routers/
│   ├── users.py         # /api/users + /api/users/{id}/summary
│   ├── expenses.py      # /api/expenses (une ligne : appelle make_money_router)
│   ├── incomes.py       # /api/incomes  (une ligne : appelle make_money_router)
│   └── common.py        # outils partagés + make_money_router (le CRUD commun dépenses / revenus)
├── tests/
│   ├── conftest.py      # fausse base MySQL (FakeDB) et client de test
│   ├── test_common.py   # filtres par mois, calcul du résumé
│   ├── test_users.py    # routes /api/users
│   └── test_money.py    # routes /api/expenses et /api/incomes (chaque test tourne pour les deux)
└── pytest.ini           # configuration de pytest
```

### Ajouter une route

1. Si de nouvelles données sont reçues : ajouter ou modifier le schéma dans `models.py`.
2. Écrire la route dans le bon fichier de `routers/` (règles dans [back.md](back.md), section 4).
3. Si c'est un nouveau fichier : l'inclure dans `main.py` avec `app.include_router(...)`.
4. Ajouter les tests dans `tests/` et lancer `pytest`.
5. Mettre à jour **cette documentation**.

### Limites connues

- **Pas d'authentification** : tout le monde peut lire et modifier les données de tout le monde. À prévoir avant une mise en ligne.
- **Pas de pagination** : les listes renvoient toutes les lignes. Suffisant tant qu'il y a peu de données.
- **Pas encore de route `/api/categories`** : les `cat_id` sont ceux des données de test (section 9).
- **E-mail en double** : vérifié avant l'enregistrement. Si deux créations avec le même e-mail arrivent exactement en même temps, MySQL bloque la deuxième (contrainte `UNIQUE`), mais l'API répond alors `500` au lieu de `409`.
