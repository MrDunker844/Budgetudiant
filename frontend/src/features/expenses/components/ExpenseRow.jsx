import Badge from "../../../shared/ui/Badge/Badge.jsx";
import Button from "../../../shared/ui/Button/Button.jsx";
import "./ExpenseRow.css";

const currency = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMoney(amount) {
  return currency.format(Number(amount) || 0);
}

export function formatDate(date) {
  if (!date) return "—";
  return dateFormatter.format(new Date(`${date}T12:00:00Z`));
}

export default function ExpenseRow({ expense, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="expense-row__description">
          <span className="expense-row__icon" aria-hidden="true">
            ↗
          </span>
          <span>
            <strong>{expense.description}</strong>
            <small>{formatDate(expense.date)}</small>
          </span>
        </div>
      </td>
      <td>
        <Badge variant="primary">
          {expense.category || "Sans catégorie"}
        </Badge>
      </td>
      <td className="expense-row__date">{formatDate(expense.date)}</td>
      <td className="expense-row__amount">− {formatMoney(expense.amount)}</td>
      <td>
        <div className="expense-row__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(expense)}
            aria-label={`Modifier ${expense.description}`}
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="expense-row__delete"
            onClick={() => onDelete(expense)}
            aria-label={`Supprimer ${expense.description}`}
          >
            Supprimer
          </Button>
        </div>
      </td>
    </tr>
  );
}
