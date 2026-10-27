
import { Plus } from "lucide-react";

import Button from "../../../../shared/ui/Button/Button.jsx";
import "./DashboardWelcome.css";

import {
  DASHBOARD_CONFIG,
  DASHBOARD_LABELS,
} from "../../dashboard.js";

import { getDisplayName } from "../../utils/dashboardFormatters.js";

export default function DashboardWelcome({ user, onAddExpense }) {
  return (
    <div className="dashboard-welcome">
      <div>
        <span className="dashboard-welcome__eyebrow">
          {DASHBOARD_CONFIG.period}
        </span>
        <h1>
          {DASHBOARD_LABELS.greeting}, {getDisplayName(user?.firstname)} !
        </h1>
        <p>{DASHBOARD_LABELS.subtitle}</p>
      </div>

      <Button className="dashboard-welcome-actions" onClick={onAddExpense}>
        <Plus size={18} aria-hidden="true" />
        {DASHBOARD_LABELS.addExpense}
      </Button>
    </div>
  );
}
