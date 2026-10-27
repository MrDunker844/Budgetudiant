
export const DASHBOARD_CONFIG = {
  brand: "BudgÉtudiant",
  locale: "fr-FR",
  currency: "EUR",
};

export const DASHBOARD_SECTIONS = {
  OVERVIEW: "overview",
  EXPENSES: "expenses",
  CATEGORIES: "categories",
  STATISTICS: "statistics",
};

export const DASHBOARD_LABELS = {
  menuTitle: "MENU PRINCIPAL",
  greeting: "Bonjour",
  unknownUser: "étudiant",
  subtitle: "Voici un aperçu de tes finances étudiantes.",
  addExpense: "Ajouter une dépense",
  monthlyIncome: "Revenus du mois",
  monthlyExpenses: "Dépenses du mois",
  balance: "Solde du mois",
  categoryTitle: "Répartition des dépenses",
  weeklyTitle: "Évolution des dépenses",
  transactionsTitle: "Dernières transactions",
  viewAll: "Voir tout",
  profile: "Mon profil",
  logout: "Se déconnecter",
  helpTitle: "Besoin d'aide ?",
  helpDescription: "Garde le contrôle de ton budget, un jour à la fois.",
  searchPlaceholder: "Rechercher une opération...",
  emptyTransactions: "Aucune opération pour le moment.",
  emptySearch: "Aucune opération ne correspond à ta recherche.",
  month: "Ce mois-ci",
};

export const DASHBOARD_NAVIGATION = [
  {
    id: DASHBOARD_SECTIONS.OVERVIEW,
    label: "Vue d'ensemble",
  },
  {
    id: DASHBOARD_SECTIONS.EXPENSES,
    label: "Mes dépenses",
  },
  {
    id: DASHBOARD_SECTIONS.CATEGORIES,
    label: "Catégories",
  },
  {
    id: DASHBOARD_SECTIONS.STATISTICS,
    label: "Statistiques",
  },
];

export const EXPENSE_FORM = {
  title: "Ajouter une dépense",
  description: "Renseigne les informations de ton achat.",
  nameLabel: "Libellé",
  namePlaceholder: "Ex. Courses alimentaires",
  amountLabel: "Montant (€)",
  amountPlaceholder: "0,00",
  categoryLabel: "Catégorie",
  cancel: "Annuler",
  submit: "Enregistrer la dépense",
  invalidAmount: "Saisis un montant supérieur à zéro.",
  invalidName: "Saisis un libellé pour cette dépense.",
};
