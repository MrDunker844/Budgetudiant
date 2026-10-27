# Spécification — Profil et initialisation du budget

1. **R1 — Accès au profil (v1)** : l’image de profil (avatar avec les initiales) en bas de la sidebar est un bouton ; cliquer dessus ouvre la page Profil (`/profile`) de l’utilisateur connecté.
2. **R2 — Modification du profil (v1)** : la page Profil permet de modifier le nom et l’adresse e-mail ; l’e-mail doit rester valide et unique.
3. **R3 — Revenu mensuel (v1)** : la page Profil permet de saisir un revenu mensuel strictement positif (champ `us_monthly_budget`, appelé « revenu mensuel » dans l’interface). Le champ peut être laissé vide (= pas encore défini).
4. **R4 — Persistance du budget (v1)** : le montant mensuel est enregistré sur l’utilisateur et reste actif jusqu’à sa prochaine modification.
5. **R5 — Tableau de bord (v1)** : le revenu mensuel du profil est **ajouté** aux « Revenus du mois » du tableau de bord (en plus des revenus enregistrés ce mois-ci) ; le solde reste calculé comme revenus du mois moins dépenses, donc il inclut aussi le revenu mensuel. Le montant du revenu mensuel reste aussi renvoyé à part (`budget_mensuel`) et la carte indique la part qui vient du profil.
6. **R6 — Données existantes (v1)** : l’initialisation du budget ne supprime ni ne modifie les revenus, dépenses ou catégories existants.
7. **R7 — Utilisateur de démonstration (v1)** : le frontend utilise l’utilisateur de démonstration `us_id = 1` tant qu’aucun système d’authentification n’est disponible.
8. **R8 — Changement de mot de passe (v1)** : la page Profil permet de changer le mot de passe en saisissant l’ancien mot de passe, le nouveau et sa confirmation.
   - Le nouveau mot de passe fait 12 à 128 caractères (comme à l’inscription).
   - La confirmation doit être identique au nouveau mot de passe (vérifié dans le frontend).
   - Si l’ancien mot de passe est faux, l’API répond **400** avec un message clair et rien n’est modifié (pas 401, pour ne pas être confondu avec une session expirée).
   - Le nouveau mot de passe est enregistré haché ; la session reste ouverte après le changement.
9. **R9 — Page Profil protégée (v1)** : `/profile` n’est accessible que connecté ; sinon l’utilisateur est renvoyé vers `/login`.
10. **R10 — Retour au tableau de bord (v1)** : la page Profil a un bouton pour revenir au tableau de bord ; après un enregistrement réussi, un message de confirmation s’affiche et les nouvelles données (nom, initiales) sont visibles.
11. **R11 — Formulaires séparés (v1)** : le formulaire « informations » (nom, e-mail, revenu) et le formulaire « mot de passe » s’enregistrent séparément ; modifier ses informations ne change jamais le mot de passe.
12. **R12 — Revenu mensuel et période (v1)** : le revenu mensuel n’est ajouté qu’au résumé d’un mois précis (`/summary?month=AAAA-MM`), pour chaque mois ; le résumé sans mois (tout l’historique) ne l’ajoute pas. Un revenu mensuel vide (`null`) n’ajoute rien.
13. **R13 — Style de la page Profil (v1)** : la page Profil réutilise les composants `shared/ui` (Card, FormField, Input, Button) et les variables de `styles/variables.css` ; pas de couleurs codées en dur.
