import "./Checkbox.css";

export default function Checkbox({
  label,
  className = "",
  id,
  ...props
}) {
  return (
    <label
      className={`ui-checkbox ${className}`.trim()}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        {...props}
      />

      {label && <span>{label}</span>}
    </label>
  );
}