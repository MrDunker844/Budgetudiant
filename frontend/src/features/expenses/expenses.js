/**
 * Service frontend des dépenses.
 * Le backend ne proposant pas encore les routes transactions, cette version
 * utilise des données de démonstration en mémoire. Les fonctions sont isolées
 * ici pour faciliter le remplacement par les appels API ensuite.
 */
const initialExpenses = [
  {
    id: 1,
    amount: 380,
    type: "depense",
    date: "2026-10-02",
    description: "Loyer",
    category_id: 2,
    category: "Logement",
  },
  {
    id: 2,
    amount: 65.4,
    type: "depense",
    date: "2026-10-08",
    description: "Courses du mois",
    category_id: 1,
    category: "Alimentation",
  },
  {
    id: 3,
    amount: 30,
    type: "depense",
    date: "2026-10-10",
    description: "Pass transport",
    category_id: 3,
    category: "Transport",
  },
  {
    id: 4,
    amount: 12.5,
    type: "depense",
    date: "2026-10-15",
    description: "Cinéma",
    category_id: 4,
    category: "Loisirs",
  },
  {
    id: 5,
    amount: 18.9,
    type: "depense",
    date: "2026-10-19",
    description: "Déjeuner universitaire",
    category_id: 1,
    category: "Alimentation",
  },
  {
    id: 6,
    amount: 9.99,
    type: "depense",
    date: "2026-10-22",
    description: "Abonnement musique",
    category_id: 4,
    category: "Loisirs",
  },
];

export const EXPENSE_CATEGORIES = [
  { id: 1, name: "Alimentation" },
  { id: 2, name: "Logement" },
  { id: 3, name: "Transport" },
  { id: 4, name: "Loisirs" },
  { id: 5, name: "Santé" },
  { id: 6, name: "Études" },
  { id: 7, name: "Autre" },
];

let expenses = [...initialExpenses];
let nextId = Math.max(...initialExpenses.map((expense) => expense.id)) + 1;

// Mode démonstration temporaire : les données ne sont pas conservées au rechargement.
export async function getExpenses() {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}

export async function createExpense(values) {
  const category = EXPENSE_CATEGORIES.find(
    (item) => item.id === Number(values.category_id),
  );
  const expense = {
    id: nextId++,
    amount: Number(values.amount),
    type: "depense",
    date: values.date,
    description: values.description.trim(),
    category_id: category?.id ?? null,
    category: category?.name ?? "Sans catégorie",
  };
  expenses = [expense, ...expenses];
  return expense;
}

export async function updateExpense(id, values) {
  const category = EXPENSE_CATEGORIES.find(
    (item) => item.id === Number(values.category_id),
  );
  const updated = {
    id,
    amount: Number(values.amount),
    type: "depense",
    date: values.date,
    description: values.description.trim(),
    category_id: category?.id ?? null,
    category: category?.name ?? "Sans catégorie",
  };
  expenses = expenses.map((expense) =>
    expense.id === id ? updated : expense,
  );
  return updated;
}

export async function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
}
