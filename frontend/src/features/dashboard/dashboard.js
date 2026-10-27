
export const DASHBOARD_CONFIG = {
  brand: "BudgÉtudiant",
  locale: "fr-FR",
  currency: "EUR",
  period: "Octobre 2026",
  monthlyBudget: 850,
  savingsGoal: 100,
  savingsProgress: 65,
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
  monthlyBudget: "Budget mensuel",
  monthlyExpenses: "Dépenses du mois",
  availableBudget: "Budget disponible",
  savingsGoal: "Objectif d'épargne",
  budgetUsed: "Budget dépensé",
  categoryTitle: "Répartition des dépenses",
  weeklyTitle: "Évolution des dépenses",
  transactionsTitle: "Dernières transactions",
  viewAll: "Voir tout",
  profile: "Mon profil",
  logout: "Se déconnecter",
  helpTitle: "Besoin d'aide ?",
  helpDescription: "Garde le contrôle de ton budget, un jour à la fois.",
  searchPlaceholder: "Rechercher une dépense...",
  emptyTransactions: "Aucune dépense pour le moment.",
  emptySearch: "Aucune dépense ne correspond à ta recherche.",
  demoNotice:
    "Données de démonstration : les modifications ne sont pas encore enregistrées.",
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

export const EXPENSE_CATEGORIES = [
  { id: "housing", label: "Logement", color: "#0b9b61" },
  { id: "food", label: "Alimentation", color: "#6366f1" },
  { id: "transport", label: "Transport", color: "#f59e0b" },
  { id: "leisure", label: "Loisirs", color: "#ec4899" },
  { id: "other", label: "Autres", color: "#64748b" },
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "transaction-1",
    label: "Courses alimentaires",
    categoryId: "food",
    date: "2026-10-26",
    amount: 32.5,
    type: "expense",
  },
  {
    id: "transaction-2",
    label: "Abonnement transport",
    categoryId: "transport",
    date: "2026-10-24",
    amount: 25,
    type: "expense",
  },
  {
    id: "transaction-3",
    label: "Loyer",
    categoryId: "housing",
    date: "2026-10-22",
    amount: 320,
    type: "expense",
  },
  {
    id: "transaction-4",
    label: "Sortie entre amis",
    categoryId: "leisure",
    date: "2026-10-20",
    amount: 18,
    type: "expense",
  },
  {
    id: "transaction-5",
    label: "Courses de la semaine",
    categoryId: "food",
    date: "2026-10-18",
    amount: 92,
    type: "expense",
  },
  {
    id: "transaction-6",
    label: "Fournitures universitaires",
    categoryId: "other",
    date: "2026-10-12",
    amount: 22,
    type: "expense",
  },
  {
    id: "transaction-7",
    label: "Cinéma",
    categoryId: "leisure",
    date: "2026-10-08",
    amount: 17,
    type: "expense",
  },
];

export const WEEKLY_EXPENSES = [
  { id: "week-1", label: "S1", amount: 85 },
  { id: "week-2", label: "S2", amount: 120 },
  { id: "week-3", label: "S3", amount: 95 },
  { id: "week-4", label: "S4", amount: 145 },
  { id: "week-5", label: "S5", amount: 79.5 },
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
