import { CalendarDays, Plus, UserRound } from "lucide-react";

import Button from "../ui/Button/Button.jsx";
import "./Header.css";

export default function Header({
  period,
  workspaceLabel,
  title,
  profileLabel,
  profileName,
  profileInitials,
  addExpenseLabel,
  onAddExpense,
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

        <a
          className="shared-header__profile"
          href="/profile"
          aria-label={
            profileName ? `Voir le profil de ${profileName}` : profileLabel
          }
          title={profileName || profileLabel}
        >
          <span className="shared-header__avatar" aria-hidden="true">
            {profileInitials}
          </span>
          <span className="shared-header__profile-label">
            <UserRound size={16} aria-hidden="true" />
            {profileLabel}
          </span>
        </a>
      </div>
    </header>
  );
}
