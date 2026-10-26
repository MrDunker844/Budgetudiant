import "./Textarea.css";

export default function Textarea({
  className = "",
  rows = 4,
  ...props
}) {
  return (
    <textarea
      rows={rows}
      className={`ui-textarea ${className}`.trim()}
      {...props}
    />
  );
}