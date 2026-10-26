import "./Select.css";

export default function Select({
  options = [],
  className = "",
  placeholder,
  ...props
}) {
  return (
    <select
      className={`ui-select ${className}`.trim()}
      {...props}
    >
      {placeholder && (
        <option value="">
          {placeholder}
        </option>
      )}

      {options.map((option) => {
        const item =
          typeof option === "string"
            ? { label: option, value: option }
            : option;

        return (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        );
      })}
    </select>
  );
}