import "./LoadingSpinner.css";

export default function LoadingSpinner({
  label = "Chargement en cours",
  size = "md",
}) {
  return (
    <div
      className="ui-loading"
      role="status"
      aria-live="polite"
    >
      <span
        className={`ui-loading__spinner ui-loading__spinner--${size}`}
        aria-hidden="true"
      />

      <span className="ui-loading__label">
        {label}
      </span>
    </div>
  );
}