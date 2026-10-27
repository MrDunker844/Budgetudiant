
import {
  Euro,
  TrendingUp,
  Wallet,
  PiggyBank,
} from "lucide-react";

import Card from "../../../../shared/ui/Card/Card.jsx";

import {
  DASHBOARD_CONFIG,
  DASHBOARD_LABELS,
} from "../../dashboard.js";

import { formatCurrency } from "../../utils/dashboardFormatters.js";
import "./SummaryCards.css";

const SUMMARY_CARDS = [
  {
    id: "budget",
    label: DASHBOARD_LABELS.monthlyBudget,
    icon: Euro,
    tone: "green",
  },
  {
    id: "expenses",
    label: DASHBOARD_LABELS.monthlyExpenses,
    icon: TrendingUp,
    tone: "purple",
  },
  {
    id: "available",
    label: DASHBOARD_LABELS.availableBudget,
    icon: Wallet,
    tone: "blue",
  },
  {
    id: "savings",
    label: DASHBOARD_LABELS.savingsGoal,
    icon: PiggyBank,
    tone: "orange",
  },
];

function SummaryCard({ card, amount, caption, progress }) {
  const Icon = card.icon;

  return (
    <Card>
      <article className="dashboard-summary-card">
        <div className="dashboard-summary-card__top">
          <span
            className={`dashboard-summary-card__icon dashboard-summary-card__icon--${card.tone}`}
          >
            <Icon size={21} aria-hidden="true" />
          </span>
          <span className="dashboard-summary-card__label">{card.label}</span>
        </div>

        <strong className="dashboard-summary-card__amount">
          {formatCurrency(amount)}
        </strong>

        <span className="dashboard-summary-card__caption">{caption}</span>

        {progress !== undefined && (
          <div className="dashboard-summary-card__progress">
            <div
              className="dashboard-progress-track"
              role="progressbar"
              aria-label="Progression de l'objectif d'épargne"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </article>
    </Card>
  );
}

export default function SummaryCards({ expensesTotal, remaining }) {
  const values = {
    budget: {
      amount: DASHBOARD_CONFIG.monthlyBudget,
      caption: "Budget prévu pour ce mois",
    },
    expenses: {
      amount: expensesTotal,
      caption: "Dépenses enregistrées",
    },
    available: {
      amount: remaining,
      caption:
        remaining < 0
          ? "Budget mensuel dépassé"
          : "Encore disponible ce mois-ci",
    },
    savings: {
      amount: DASHBOARD_CONFIG.savingsGoal,
      caption: `${DASHBOARD_CONFIG.savingsProgress} % de ton objectif atteint`,
      progress: DASHBOARD_CONFIG.savingsProgress,
    },
  };

  return (
    <section
      className="dashboard-summary-grid"
      aria-label="Résumé budgétaire"
    >
      {SUMMARY_CARDS.map((card) => (
        <SummaryCard
          key={card.id}
          card={card}
          {...values[card.id]}
        />
      ))}
    </section>
  );
}
