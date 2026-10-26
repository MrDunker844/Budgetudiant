SET NAMES utf8mb4;
-- Création de la base Budget Étudiant
CREATE DATABASE IF NOT EXISTS budget_etudiant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE budget_etudiant;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('revenu', 'depense') NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Données de test
INSERT INTO categories (name) VALUES
    ('Alimentation'), ('Logement'), ('Transport'), ('Loisirs'), ('Salaire'), ('Bourse');

INSERT INTO transactions (amount, type, date, description, category_id) VALUES
    (450.00, 'revenu',  '2026-10-01', 'Bourse CROUS',        6),
    (600.00, 'revenu',  '2026-10-05', 'Job étudiant',        5),
    (380.00, 'depense', '2026-10-02', 'Loyer',               2),
    (65.40,  'depense', '2026-10-08', 'Courses',             1),
    (30.00,  'depense', '2026-10-10', 'Pass Navigo',         3),
    (12.50,  'depense', '2026-10-15', 'Cinéma',              4);
