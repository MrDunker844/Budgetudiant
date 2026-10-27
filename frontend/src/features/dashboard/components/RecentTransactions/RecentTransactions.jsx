
import {
  Search,
  ChevronRight,
  Tags,
  House,
  BookOpen,
  Utensils,
  Bus,
  PartyPopper,
} from "lucide-react";

import Card from "../../../../shared/ui/Card/Card.jsx";
import { DASHBOARD_CONFIG, DASHBOARD_LABELS } from "../../dashboard.js";
import { formatCurrency, formatDate } from "../../utils/dashboardFormatters.js";
import "./RecentTransactions.css";

const CATEGORY_ICONS = {
  alimentation: Utensils,
  logement: House,
  transport: Bus,
  loisirs: PartyPopper,
  etudes: BookOpen,
  santé: Tags,
  sante: Tags,
  "job étudiant": Tags,
  aides: Tags,
};

function getCategoryIcon(categoryName) {
  const key = categoryName
    ?.normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase(DASHBOARD_CONFIG.locale);
  return CATEGORY_ICONS[key] ?? Tags;
}

export default function RecentTransactions({
  transactions,
  categories,
  search,
  onSearchChange,
  onViewAll,
}) {
  const query = search.trim().toLocaleLowerCase(DASHBOARD_CONFIG.locale);

  const filteredTransactions = transactions.filter((transaction) => {
    const category = categories.find(
      (item) => item.cat_id === transaction.categoryId
    );

    return (
      transaction.label.toLocaleLowerCase(DASHBOARD_CONFIG.locale).includes(query) ||
      category?.cat_name.toLocaleLowerCase(DASHBOARD_CONFIG.locale).includes(query)
    );
  });

  return (
    <Card className="dashboard-recent-transactions">
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
              const category = categories.find(
                (item) => item.cat_id === transaction.categoryId
              );
              const Icon = getCategoryIcon(category?.cat_name);

              return (
                <article
                  className="dashboard-transaction"
                  key={transaction.id}
                >
                  <span
                    className="dashboard-transaction__icon"
                    style={
                      category
                        ? { color: category.cat_color }
                        : undefined
                    }
                  >
                    <Icon size={19} aria-hidden="true" />
                  </span>

                  <div className="dashboard-transaction__details">
                    <strong>{transaction.label}</strong>
                    <span>
                      {category?.cat_name ?? "Sans catégorie"} ·{" "}
                      {formatDate(transaction.date)}
                    </span>
                  </div>

                  <strong
                    className={`dashboard-transaction__amount dashboard-transaction__amount--${transaction.type}`}
                  >
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
