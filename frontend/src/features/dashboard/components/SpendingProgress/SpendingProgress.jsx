
import { DASHBOARD_CONFIG, DASHBOARD_LABELS } from "../../dashboard.js";
import { getPercentage } from "../../utils/dashboardCalculations.js";
import { formatCurrency } from "../../utils/dashboardFormatters.js";
import "./SpendingProgress.css";

export default function SpendingProgress({ expensesTotal }) {
  const budget = DASHBOARD_CONFIG.monthlyBudget;
  const spentPercentage = getPercentage(expensesTotal, budget);
  const progressPercentage = Math.min(spentPercentage, 100);

  return (
    <div className="dashboard-spending-progress">
      <div className="dashboard-spending-progress__heading">
        <div>
          <span>{DASHBOARD_LABELS.budgetUsed}</span>
          <strong>{spentPercentage} %</strong>
        </div>
        <span className="dashboard-spending-progress__amount">
          {formatCurrency(expensesTotal)} / {formatCurrency(budget)}
        </span>
      </div>

      <div
        className="dashboard-progress-track dashboard-progress-track--large"
        role="progressbar"
        aria-label="Pourcentage du budget dépensé"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercentage}
      >
        <span
          className={
            spentPercentage >= 90
              ? "dashboard-progress-track__fill--warning"
              : ""
          }
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {spentPercentage >= 90 && (
        <p className="dashboard-spending-progress__warning">
          Tu approches de la limite de ton budget mensuel.
        </p>
      )}
    </div>
  );
}
