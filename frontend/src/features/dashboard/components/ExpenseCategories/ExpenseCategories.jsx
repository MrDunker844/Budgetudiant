
import { useMemo } from "react";
import {
  Tags,
  House,
  Utensils,
  Bus,
  PartyPopper,
  ShoppingBag,
} from "lucide-react";

import Card from "../../../../shared/ui/Card/Card.jsx";
import { DASHBOARD_LABELS } from "../../dashboard.js";
import { getPercentage } from "../../utils/dashboardCalculations.js";
import { formatCurrency } from "../../utils/dashboardFormatters.js";
import SpendingProgress from "../SpendingProgress/SpendingProgress.jsx";
import "./ExpenseCategories.css";

const CATEGORY_ICONS = {
  housing: House,
  food: Utensils,
  transport: Bus,
  leisure: PartyPopper,
  other: ShoppingBag,
};

export default function ExpenseCategories({ categories, expensesTotal }) {
  const gradient = useMemo(() => {
    if (expensesTotal <= 0) {
      return "conic-gradient(var(--border) 0% 100%)";
    }

    let currentPercentage = 0;

    const segments = categories.map((category) => {
      const start = currentPercentage;
      currentPercentage += (category.amount / expensesTotal) * 100;

      return `${category.color} ${start}% ${currentPercentage}%`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [categories, expensesTotal]);

  return (
    <Card>
      <section className="dashboard-categories">
        <div className="dashboard-card-heading">
          <div>
            <h2>{DASHBOARD_LABELS.categoryTitle}</h2>
            <p>Comprends où va ton argent.</p>
          </div>
          <span className="dashboard-subtle-label">
            {DASHBOARD_LABELS.month}
          </span>
        </div>

        <SpendingProgress expensesTotal={expensesTotal} />

        {categories.length === 0 ? (
          <div className="dashboard-category-empty">
            <Tags size={28} aria-hidden="true" />
            <p>Aucune dépense à répartir pour le moment.</p>
          </div>
        ) : (
          <div className="dashboard-donut-layout">
            <div
              className="dashboard-donut"
              style={{ "--dashboard-donut-gradient": gradient }}
              role="img"
              aria-label={`Répartition des dépenses : ${formatCurrency(expensesTotal)}`}
            >
              <div className="dashboard-donut__center">
                <span>Total dépensé</span>
                <strong>{formatCurrency(expensesTotal)}</strong>
              </div>
            </div>

            <div className="dashboard-category-legend">
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.id] ?? Tags;

                return (
                  <div
                    className="dashboard-category-legend__item"
                    key={category.id}
                  >
                    <span
                      className="dashboard-category-legend__dot"
                      style={{ backgroundColor: category.color }}
                    />
                    <Icon
                      size={17}
                      className="dashboard-category-legend__icon"
                      aria-hidden="true"
                    />
                    <div className="dashboard-category-legend__details">
                      <span>{category.label}</span>
                      <strong>{formatCurrency(category.amount)}</strong>
                      <small>
                        {getPercentage(category.amount, expensesTotal)} %
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </Card>
  );
}
