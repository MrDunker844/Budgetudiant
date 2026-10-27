
import {
  Search,
  ChevronRight,
  Tags,
  House,
  Utensils,
  Bus,
  PartyPopper,
  ShoppingBag,
} from "lucide-react";

import Card from "../../../../shared/ui/Card/Card.jsx";
import {
  DASHBOARD_CONFIG,
  DASHBOARD_LABELS,
  EXPENSE_CATEGORIES,
} from "../../dashboard.js";
import { formatCurrency, formatDate } from "../../utils/dashboardFormatters.js";
import "./RecentTransactions.css";

const CATEGORY_ICONS = {
  housing: House,
  food: Utensils,
  transport: Bus,
  leisure: PartyPopper,
  other: ShoppingBag,
};

export default function RecentTransactions({
  transactions,
  search,
  onSearchChange,
  onViewAll,
}) {
  const query = search.trim().toLocaleLowerCase(DASHBOARD_CONFIG.locale);

  const filteredTransactions = transactions.filter((transaction) => {
    const category = EXPENSE_CATEGORIES.find(
      (item) => item.id === transaction.categoryId
    );

    return (
      transaction.label.toLocaleLowerCase(DASHBOARD_CONFIG.locale).includes(query) ||
      category?.label.toLocaleLowerCase(DASHBOARD_CONFIG.locale).includes(query)
    );
  });

  return (
    <Card>
      <section className="dashboard-transactions">
        <div className="dashboard-card-heading dashboard-card-heading--transactions">
          <div>
            <h2>{DASHBOARD_LABELS.transactionsTitle}</h2>
            <p>Retrouve facilement tes dernières opérations.</p>
          </div>

          <button
            type="button"
            className="dashboard-view-all"
            onClick={onViewAll}
          >
            {DASHBOARD_LABELS.viewAll}
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>

        <label className="dashboard-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder={DASHBOARD_LABELS.searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        {filteredTransactions.length === 0 ? (
          <p className="dashboard-empty">
            {transactions.length === 0
              ? DASHBOARD_LABELS.emptyTransactions
              : DASHBOARD_LABELS.emptySearch}
          </p>
        ) : (
          <div className="dashboard-transaction-list">
            {filteredTransactions.map((transaction) => {
              const category = EXPENSE_CATEGORIES.find(
                (item) => item.id === transaction.categoryId
              );
              const Icon = CATEGORY_ICONS[transaction.categoryId] ?? Tags;

              return (
                <article
                  className="dashboard-transaction"
                  key={transaction.id}
                >
                  <span className="dashboard-transaction__icon">
                    <Icon size={19} aria-hidden="true" />
                  </span>

                  <div className="dashboard-transaction__details">
                    <strong>{transaction.label}</strong>
                    <span>
                      {category?.label ?? "Autres"} · {formatDate(transaction.date)}
                    </span>
                  </div>

                  <strong className="dashboard-transaction__amount">
                    {transaction.type === "income" ? "+" : "−"}
                    {formatCurrency(transaction.amount)}
                  </strong>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Card>
  );
}
