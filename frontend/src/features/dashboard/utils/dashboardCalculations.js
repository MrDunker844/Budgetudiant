
export function getPercentage(amount, total) {
  return total > 0 ? Math.round((amount / total) * 100) : 0;
}

export function getExpenseCategories(transactions, categories) {
  const groupedCategories = categories.map((category) => {
    const amount = transactions.reduce((total, transaction) => {
      if (
        transaction.type !== "expense" ||
        transaction.categoryId !== category.cat_id
      ) {
        return total;
      }

      return total + transaction.amount;
    }, 0);

    return {
      id: category.cat_id,
      label: category.cat_name,
      color: category.cat_color,
      amount,
    };
  }).filter((category) => category.amount > 0);

  const uncategorizedAmount = transactions.reduce((total, transaction) => {
    return transaction.type === "expense" &&
      (transaction.categoryId === null || transaction.categoryId === undefined)
      ? total + transaction.amount
      : total;
  }, 0);

  if (uncategorizedAmount > 0) {
    groupedCategories.push({
      id: "uncategorized",
      label: "Sans catégorie",
      color: "#64748b",
      amount: uncategorizedAmount,
    });
  }

  return groupedCategories;
}

export function getWeeklyExpenses(transactions, month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const weekCount = Math.ceil(daysInMonth / 7);
  const weeks = Array.from({ length: weekCount }, (_, index) => ({
    id: `week-${index + 1}`,
    label: `S${index + 1}`,
    amount: 0,
  }));

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const day = Number(transaction.date.slice(8, 10));
    const weekIndex = Math.floor((day - 1) / 7);
    if (weeks[weekIndex]) {
      weeks[weekIndex].amount += transaction.amount;
    }
  }

  return weeks;
}
