import { useEffect, useState } from "react";
import Button from "../../../shared/ui/Button/Button.jsx";
import Input from "../../../shared/ui/Input/Input.jsx";
import Select from "../../../shared/ui/Select/Select.jsx";
import FormField from "../../../shared/ui/FormField/FormField.jsx";
import { EXPENSE_CATEGORIES } from "../expenses.js";

function getInitialValues(expense) {
  return {
    description: expense?.description ?? "",
    amount: expense ? String(expense.amount) : "",
    date: expense?.date ?? new Date().toISOString().slice(0, 10),
    category_id: expense?.category_id ? String(expense.category_id) : "",
  };
}

export default function ExpenseForm({
  expense = null,
  onSubmit,
  onCancel,
  saving = false,
}) {
  const [values, setValues] = useState(() => getInitialValues(expense));
  const [error, setError] = useState("");

  useEffect(() => {
    setValues(getInitialValues(expense));
    setError("");
  }, [expense]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const amount = Number(values.amount);
    if (!values.description.trim()) {
      setError("Ajoute une description à cette dépense.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Le montant doit être supérieur à 0 €.");
      return;
    }
    if (!values.date) {
      setError("Choisis une date.");
      return;
    }
    if (!values.category_id) {
      setError("Choisis une catégorie.");
      return;
    }

    try {
      await onSubmit({
        ...values,
        amount,
        category_id: Number(values.category_id),
      });
    } catch (submitError) {
      setError(submitError.message || "Impossible d'enregistrer la dépense.");
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <FormField label="Description" htmlFor="expense-description" required>
        <Input
          id="expense-description"
          name="description"
          value={values.description}
          onChange={updateField}
          placeholder="Ex. : courses du mois"
          maxLength={100}
          required
          autoFocus
        />
      </FormField>

      <div className="expense-form__grid">
        <FormField label="Montant (€)" htmlFor="expense-amount" required>
          <Input
            id="expense-amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={values.amount}
            onChange={updateField}
            placeholder="0,00"
            required
          />
        </FormField>
        <FormField label="Date" htmlFor="expense-date" required>
          <Input
            id="expense-date"
            name="date"
            type="date"
            value={values.date}
            onChange={updateField}
            required
          />
        </FormField>
      </div>

      <FormField label="Catégorie" htmlFor="expense-category" required>
        <Select
          id="expense-category"
          name="category_id"
          value={values.category_id}
          onChange={updateField}
          placeholder="Sélectionner une catégorie"
          options={EXPENSE_CATEGORIES.map((category) => ({
            value: String(category.id),
            label: category.name,
          }))}
          required
        />
      </FormField>

      {error && (
        <p className="expense-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="expense-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving
            ? "Enregistrement…"
            : expense
              ? "Enregistrer les modifications"
              : "Ajouter la dépense"}
        </Button>
      </div>
    </form>
  );
}
