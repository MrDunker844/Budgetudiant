import { useEffect } from "react";
import Button from "../Button/Button.jsx";
import "./Modal.css";

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  className = "",
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ui-modal__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className={`ui-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Fenêtre de dialogue"}
      >
        <header className="ui-modal__header">
          <h2 className="ui-modal__title">
            {title}
          </h2>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Fermer la fenêtre"
            onClick={onClose}
          >
            ✕
          </Button>
        </header>

        <div className="ui-modal__body">
          {children}
        </div>

        {footer && (
          <footer className="ui-modal__footer">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
