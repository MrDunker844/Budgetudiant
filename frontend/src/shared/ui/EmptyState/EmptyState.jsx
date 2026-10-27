import Button from "../Button/Button.jsx";
import "./EmptyState.css";

export default function EmptyState({
  title = "Aucun élément",
  description,
  actionLabel,
  onAction,
  icon = "○",
}) {
  return (
    <div className="ui-empty-state">
      <div
        className="ui-empty-state__icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      <h2 className="ui-empty-state__title">
        {title}
      </h2>

      {description && (
        <p className="ui-empty-state__description">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}