import "./Card.css";

export default function Card({
  children,
  className = "",
  as: Component = "section",
  ...props
}) {
  return (
    <Component
      className={`ui-card ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}