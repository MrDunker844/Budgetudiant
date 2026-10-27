import "./FormField.css";

export default function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={`ui-form-field ${className}`.trim()}>
      {label && (
        <label
          className="ui-form-field__label"
          htmlFor={htmlFor}
        >
          {label}

          {required && (
            <span className="ui-form-field__required">
              {" "}*
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p className="ui-form-field__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="ui-form-field__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}