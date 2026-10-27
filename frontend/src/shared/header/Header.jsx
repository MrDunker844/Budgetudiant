import { CalendarDays } from "lucide-react";

import "./Header.css";

export default function Header({
  period,
  workspaceLabel,
  title,
}) {
  return (
    <header className="shared-header">
      <div className="shared-header__breadcrumb">
        <span>{workspaceLabel}</span>
        <span aria-hidden="true">/</span>
        <strong>{title}</strong>
      </div>

      <div className="shared-header__actions">
        <span className="shared-header__period">
          <CalendarDays size={17} aria-hidden="true" />
          {period}
        </span>
      </div>
    </header>
  );
}
