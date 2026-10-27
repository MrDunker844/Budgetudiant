
import {
  LayoutDashboard,
  ReceiptText,
  Tags,
  ChartNoAxesColumn,
  LogOut,
  CircleHelp,
} from "lucide-react";

import {
  DASHBOARD_CONFIG,
  DASHBOARD_LABELS,
  DASHBOARD_NAVIGATION,
  DASHBOARD_SECTIONS,
} from "../../features/dashboard/dashboard.js";
import "./Sidebar.css";

const NAVIGATION_ICONS = {
  [DASHBOARD_SECTIONS.OVERVIEW]: LayoutDashboard,
  [DASHBOARD_SECTIONS.EXPENSES]: ReceiptText,
  [DASHBOARD_SECTIONS.CATEGORIES]: Tags,
  [DASHBOARD_SECTIONS.STATISTICS]: ChartNoAxesColumn,
};

export default function Sidebar({ activeSection, onNavigate, onLogout }) {
  return (
    <aside className="dashboard-sidebar">
      <a className="dashboard-brand" href="/" aria-label={DASHBOARD_CONFIG.brand}>
        <span className="dashboard-brand__icon">B.</span>
        <span>{DASHBOARD_CONFIG.brand}</span>
      </a>

      <p className="dashboard-sidebar__section-label">
        {DASHBOARD_LABELS.menuTitle}
      </p>

      <nav className="dashboard-navigation" aria-label="Navigation principale">
        {DASHBOARD_NAVIGATION.map((item) => {
          const Icon = NAVIGATION_ICONS[item.id];

          return (
            <button
              key={item.id}
              type="button"
              className={`dashboard-navigation__item ${
                activeSection === item.id
                  ? "dashboard-navigation__item--active"
                  : ""
              }`}
              onClick={() => onNavigate(item.id)}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="dashboard-sidebar__bottom">
        <div className="dashboard-help">
          <span className="dashboard-help__icon">
            <CircleHelp size={20} aria-hidden="true" />
          </span>
          <strong>{DASHBOARD_LABELS.helpTitle}</strong>
          <p>{DASHBOARD_LABELS.helpDescription}</p>
        </div>

        <button className="dashboard-logout" type="button" onClick={onLogout}>
          <LogOut size={18} aria-hidden="true" />
          <span>{DASHBOARD_LABELS.logout}</span>
        </button>
      </div>
    </aside>
  );
}
