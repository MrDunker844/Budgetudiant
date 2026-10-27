
import { EXPENSE_CATEGORIES } from "../dashboard.js";

export function getPercentage(amount, total) {
  return total > 0 ? Math.round((amount / total) * 100) : 0;
}

export function getExpensesTotal(transactions) {
  return transactions.reduce((total, transaction) => {
    return transaction.type === "expense"
      ? total + transaction.amount
      : total;
  }, 0);
}

export function getExpenseCategories(transactions) {
  return EXPENSE_CATEGORIES.map((category) => {
    const amount = transactions.reduce((total, transaction) => {
      if (
        transaction.type !== "expense" ||
        transaction.categoryId !== category.id
      ) {
        return total;
      }

      return total + transaction.amount;
    }, 0);

    return { ...category, amount };
  }).filter((category) => category.amount > 0);
}
