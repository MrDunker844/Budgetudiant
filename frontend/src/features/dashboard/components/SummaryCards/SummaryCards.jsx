
import {
  Euro,
  TrendingUp,
  Scale,
} from "lucide-react";

import Card from "../../../../shared/ui/Card/Card.jsx";

import { DASHBOARD_LABELS } from "../../dashboard.js";

import { formatCurrency } from "../../utils/dashboardFormatters.js";
import "./SummaryCards.css";

const SUMMARY_CARDS = [
  {
    id: "income",
    label: DASHBOARD_LABELS.monthlyIncome,
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
    id: "balance",
    label: DASHBOARD_LABELS.balance,
    icon: Scale,
    tone: "blue",
  },
];

function SummaryCard({ card, amount, caption }) {
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

      </article>
    </Card>
  );
}

// R5 : total_revenus contient déjà le revenu mensuel du profil (ajouté par l'API)
function getIncomeCaption(monthlyIncome) {
  return monthlyIncome == null
    ? "Revenus enregistrés ce mois-ci"
    : `Dont ${formatCurrency(monthlyIncome)} de revenu mensuel (profil)`;
}

export default function SummaryCards({ summary }) {
  const values = {
    income: {
      amount: summary.total_revenus,
      caption: getIncomeCaption(summary.budget_mensuel),
    },
    expenses: {
      amount: summary.total_depenses,
      caption: "Dépenses enregistrées ce mois-ci",
    },
    balance: {
      amount: summary.solde,
      caption: "Revenus moins dépenses",
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
