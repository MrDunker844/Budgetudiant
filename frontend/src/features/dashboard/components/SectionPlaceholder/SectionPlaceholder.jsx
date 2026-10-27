
import {
  LayoutDashboard,
  ReceiptText,
  Tags,
  ChartNoAxesColumn,
} from "lucide-react";

import Card from "../../../../shared/ui/Card/Card.jsx";
import {
  DASHBOARD_NAVIGATION,
  DASHBOARD_SECTIONS,
} from "../../dashboard.js";
import "./SectionPlaceholder.css";

const SECTION_ICONS = {
  [DASHBOARD_SECTIONS.OVERVIEW]: LayoutDashboard,
  [DASHBOARD_SECTIONS.EXPENSES]: ReceiptText,
  [DASHBOARD_SECTIONS.CATEGORIES]: Tags,
  [DASHBOARD_SECTIONS.STATISTICS]: ChartNoAxesColumn,
};

export default function SectionPlaceholder({ activeSection }) {
  const section = DASHBOARD_NAVIGATION.find(
    (item) => item.id === activeSection
  );
  const Icon = SECTION_ICONS[activeSection] ?? LayoutDashboard;

  return (
    <Card>
      <div className="dashboard-placeholder">
        <span className="dashboard-placeholder__icon">
          <Icon size={28} aria-hidden="true" />
        </span>
        <h2>{section?.label ?? "Vue d'ensemble"}</h2>
        <p>Cette section sera développée dans une prochaine étape.</p>
      </div>
    </Card>
  );
}
