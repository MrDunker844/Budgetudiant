import { request } from "./api.js";

const categoryKeyByName = new Map([
  ["logement", "housing"],
  ["alimentation", "food"],
  ["transport", "transport"],
  ["loisirs", "leisure"],
]);

function getCategoryKey(name) {
  return categoryKeyByName.get(
    name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr-FR"),
  ) || "other";
}

export async function getDashboardTransactions() {
  const userId = Number(import.meta.env.VITE_USER_ID || 1);
  const [expenses, categories] = await Promise.all([
    request(`/api/expenses/?user_id=${userId}`),
    request("/api/categories/"),
  ]);
  const categoryById = new Map(
    categories.map((category) => [category.cat_id, category]),
  );

  return expenses.map((expense) => {
    const category = categoryById.get(expense.categorie_id);

    return {
      id: expense.ex_id,
      label: expense.ex_title,
      categoryId: getCategoryKey(category?.cat_name),
      date: String(expense.ex_date).slice(0, 10),
      amount: Number(expense.ex_amount),
      type: "expense",
    };
  });
}
