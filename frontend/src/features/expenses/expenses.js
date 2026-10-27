import {
  createExpense as createApiExpense,
  deleteExpense as deleteApiExpense,
  getExpenses as getApiExpenses,
  updateExpense as updateApiExpense,
} from "../../services/api.js";

function toApiExpense(userId, values) {
  return {
    user_id: userId,
    categorie_id: values.category_id ? Number(values.category_id) : null,
    ex_title: values.description.trim(),
    ex_amount: Number(values.amount),
    ex_date: values.date,
    ex_description: null,
  };
}

function fromApiExpense(expense, categories) {
  const categoryId = expense.categorie_id;
  const category = categories.find(
    (item) => Number(item.cat_id) === Number(categoryId),
  );

  return {
    id: expense.ex_id,
    amount: Number(expense.ex_amount),
    type: "depense",
    date: expense.ex_date,
    description: expense.ex_title,
    category_id: categoryId,
    category: category?.cat_name ?? "Sans catégorie",
  };
}

export async function getExpenses(userId, categories = []) {
  const expenses = await getApiExpenses(userId);
  return expenses.map((expense) => fromApiExpense(expense, categories));
}

export async function createExpense(userId, values) {
  return createApiExpense(toApiExpense(userId, values));
}

export async function updateExpense(userId, id, values) {
  return updateApiExpense(id, toApiExpense(userId, values));
}

export async function deleteExpense(id) {
  return deleteApiExpense(id);
}
