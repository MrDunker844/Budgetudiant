
import { ChartNoAxesColumn } from "lucide-react";
import Card from "../../../../shared/ui/Card/Card.jsx";
import { DASHBOARD_LABELS } from "../../dashboard.js";
import "./WeeklyChart.css";

const NUMBER_FORMATTER = new Intl.NumberFormat("fr-FR");

export default function WeeklyChart({ weeks }) {
  const maximum = Math.max(...weeks.map((week) => week.amount), 1);

  return (
    <Card>
      <section className="dashboard-weekly-chart">
        <div className="dashboard-card-heading">
          <div>
            <h2>{DASHBOARD_LABELS.weeklyTitle}</h2>
            <p>Suivi de tes dépenses par semaine.</p>
          </div>
          <ChartNoAxesColumn
            size={20}
            color="var(--primary)"
            aria-hidden="true"
          />
        </div>

        <div
          className="dashboard-weekly-chart__bars"
          role="img"
          aria-label="Graphique des dépenses hebdomadaires"
        >
          {weeks.map((week) => (
            <div className="dashboard-weekly-chart__column" key={week.id}>
              <span className="dashboard-weekly-chart__value">
                {NUMBER_FORMATTER.format(week.amount)} €
              </span>
              <div className="dashboard-weekly-chart__bar-track">
                <span
                  className="dashboard-weekly-chart__bar"
                  style={{ height: `${(week.amount / maximum) * 100}%` }}
                />
              </div>
              <span className="dashboard-weekly-chart__label">
                {week.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </Card>
  );
}
