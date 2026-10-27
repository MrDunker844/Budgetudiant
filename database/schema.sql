SET NAMES utf8mb4;
-- =========================================================
-- Base Budget Étudiant : users, categories, expenses, incomes
-- ⚠️ Ce script supprime puis recrée les tables (données locales effacées)
-- =========================================================
CREATE DATABASE IF NOT EXISTS budget_etudiant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE budget_etudiant;

-- Ordre de suppression : d'abord la table qui contient les clés étrangères
DROP TABLE IF EXISTS incomes;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS transactions;   -- ancienne table, supprimée
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ---------- Utilisateurs ----------
CREATE TABLE users (
    us_id          INT AUTO_INCREMENT PRIMARY KEY,
    us_name        VARCHAR(100) NOT NULL,
    us_email       VARCHAR(255) NOT NULL UNIQUE,
    us_created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Catégories (communes à tous les utilisateurs) ----------
CREATE TABLE categories (
    cat_id           INT AUTO_INCREMENT PRIMARY KEY,
    cat_name         VARCHAR(50) NOT NULL UNIQUE,
    cat_color        CHAR(7) NOT NULL DEFAULT '#888888',   -- couleur hexadécimale, ex. #4CAF50
    cat_description  VARCHAR(255),
    cat_created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Dépenses ----------
CREATE TABLE expenses (
    ex_id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    categorie_id    INT,
    ex_title        VARCHAR(100) NOT NULL,
    ex_amount       DECIMAL(10, 2) NOT NULL CHECK (ex_amount > 0),
    ex_date         DATE NOT NULL,
    ex_description  VARCHAR(255),
    ex_created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Si on supprime un utilisateur, ses dépenses sont supprimées
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id)
        REFERENCES users(us_id) ON DELETE CASCADE,
    -- Si on supprime une catégorie, les dépenses restent mais sans catégorie
    CONSTRAINT fk_expenses_category FOREIGN KEY (categorie_id)
        REFERENCES categories(cat_id) ON DELETE SET NULL
);

-- ---------- Revenus (même structure que expenses) ----------
CREATE TABLE incomes (
    inc_id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    categorie_id     INT,
    inc_title        VARCHAR(100) NOT NULL,
    inc_amount       DECIMAL(10, 2) NOT NULL CHECK (inc_amount > 0),
    inc_date         DATE NOT NULL,
    inc_description  VARCHAR(255),
    inc_created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_incomes_user FOREIGN KEY (user_id)
        REFERENCES users(us_id) ON DELETE CASCADE,
    CONSTRAINT fk_incomes_category FOREIGN KEY (categorie_id)
        REFERENCES categories(cat_id) ON DELETE SET NULL
);

-- =========================================================
-- Données de test
-- =========================================================
INSERT INTO users (us_name, us_email) VALUES
    ('Alice Martin', 'alice@example.com'),
    ('Bob Durand',   'bob@example.com');

INSERT INTO categories (cat_name, cat_color, cat_description) VALUES
    ('Alimentation', '#4CAF50', 'Courses, restaurant universitaire, snacks'),
    ('Logement',     '#2196F3', 'Loyer, charges, assurance habitation'),
    ('Transport',    '#FF9800', 'Abonnement, essence, train'),
    ('Loisirs',      '#9C27B0', 'Sorties, cinéma, abonnements'),
    ('Études',       '#795548', 'Livres, fournitures, frais d''inscription'),
    ('Santé',        '#F44336', 'Pharmacie, mutuelle, médecin'),
    ('Bourse',       '#009688', 'Bourse sur critères sociaux (CROUS)'),
    ('Job étudiant', '#3F51B5', 'Salaire d''un emploi à temps partiel'),
    ('Aides',        '#00BCD4', 'APL, aide des parents, primes');

INSERT INTO expenses (user_id, categorie_id, ex_title, ex_amount, ex_date, ex_description) VALUES
    (1, 2, 'Loyer octobre',      380.00, '2026-10-02', 'Studio CROUS'),
    (1, 1, 'Courses Lidl',        65.40, '2026-10-08', NULL),
    (1, 3, 'Pass Navigo',         30.00, '2026-10-10', 'Tarif étudiant'),
    (1, 4, 'Cinéma',              12.50, '2026-10-15', 'Séance du soir'),
    (1, 5, 'Livre d''algorithmique', 42.00, '2026-10-18', NULL),
    (2, 2, 'Loyer octobre',      450.00, '2026-10-01', 'Colocation'),
    (2, 1, 'Restaurant U',        13.20, '2026-10-12', '4 repas'),
    (2, 6, 'Pharmacie',            8.90, '2026-10-20', NULL);

INSERT INTO incomes (user_id, categorie_id, inc_title, inc_amount, inc_date, inc_description) VALUES
    (1, 7, 'Bourse octobre',   450.00, '2026-10-05', 'Échelon 4'),
    (1, 8, 'Salaire McDo',     320.00, '2026-10-01', '12 h / semaine'),
    (1, 9, 'APL',              180.00, '2026-10-06', NULL),
    (2, 8, 'Salaire babysitting', 400.00, '2026-10-03', NULL),
    (2, 9, 'Aide des parents', 300.00, '2026-10-01', 'Virement mensuel');
