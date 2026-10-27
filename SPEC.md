# Spécification — Profil et initialisation du budget

1. **R1 — Accès au profil (v1)** : cliquer sur le compte dans le header ouvre la page Profil de l’utilisateur connecté.
2. **R2 — Modification du profil (v1)** : la page Profil permet de modifier le nom et l’adresse e-mail ; l’e-mail doit rester valide et unique.
3. **R3 — Budget mensuel (v1)** : la page Profil permet de saisir un montant mensuel disponible strictement positif.
4. **R4 — Persistance du budget (v1)** : le montant mensuel est enregistré sur l’utilisateur et reste actif jusqu’à sa prochaine modification.
5. **R5 — Tableau de bord (v1)** : le budget mensuel est affiché séparément du solde actuel ; le solde reste calculé comme revenus moins dépenses.
6. **R6 — Données existantes (v1)** : l’initialisation du budget ne supprime ni ne modifie les revenus, dépenses ou catégories existants.
7. **R7 — Utilisateur de démonstration (v1)** : le frontend utilise l’utilisateur de démonstration `us_id = 1` tant qu’aucun système d’authentification n’est disponible.
