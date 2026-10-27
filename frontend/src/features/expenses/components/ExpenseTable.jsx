import EmptyState from "../../../shared/ui/EmptyState/EmptyState.jsx";
import ExpenseRow from "./ExpenseRow.jsx";
import "../../../shared/ui/Table/Table.css";
import "./ExpenseTable.css";

export default function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  onAdd,
}) {
  if (expenses.length === 0) {
    return (
      <div className="expense-table__empty">
        <EmptyState
          icon="↗"
          title="Aucune dépense trouvée"
          description="Essaie de modifier les filtres ou ajoute une nouvelle dépense."
          actionLabel="Ajouter une dépense"
          onAction={onAdd}
        />
      </div>
    );
  }

  return (
    <div className="ui-table-wrapper expense-table">
      <table className="ui-table">
        <thead>
          <tr>
            <th scope="col">DÉPENSE</th>
            <th scope="col">CATÉGORIE</th>
            <th scope="col">DATE</th>
            <th scope="col">MONTANT</th>
            <th scope="col">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
