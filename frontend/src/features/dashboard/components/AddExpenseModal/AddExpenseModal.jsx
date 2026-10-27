
import { useState } from "react";
import { Check, X } from "lucide-react";

import Button from "../../../../shared/ui/Button/Button.jsx";
import { EXPENSE_FORM } from "../../dashboard.js";
import "./AddExpenseModal.css";

const MIN_EXPENSE_AMOUNT = 0.01;
const AMOUNT_DECIMAL_PLACES = 2;
const MAX_EXPENSE_LABEL_LENGTH = 100;

export default function AddExpenseModal({ categories, onClose, onAdd }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const parsedAmount = Number(amount.replace(",", "."));

    if (!label.trim()) {
      setError(EXPENSE_FORM.invalidName);
      return;
    }

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount < MIN_EXPENSE_AMOUNT
    ) {
      setError(EXPENSE_FORM.invalidAmount);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const today = new Date();
      const date = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      await onAdd({
        categorie_id: categoryId ? Number(categoryId) : null,
        ex_title: label.trim(),
        ex_amount: Number(parsedAmount.toFixed(AMOUNT_DECIMAL_PLACES)),
        ex_date: date,
        ex_description: null,
      });
    } catch (submissionError) {
      setError(submissionError.message || "Impossible d'enregistrer la dépense.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="dashboard-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="dashboard-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
      >
        <div className="dashboard-modal__heading">
          <div>
            <h2 id="dashboard-modal-title">{EXPENSE_FORM.title}</h2>
            <p>{EXPENSE_FORM.description}</p>
          </div>

          <button
            type="button"
            className="dashboard-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form className="dashboard-expense-form" onSubmit={handleSubmit}>
          <label>
            {EXPENSE_FORM.nameLabel}
            <input
              autoFocus
              required
              maxLength={MAX_EXPENSE_LABEL_LENGTH}
              disabled={isSubmitting}
              value={label}
              onChange={(event) => {
                setLabel(event.target.value);
                setError("");
              }}
              placeholder={EXPENSE_FORM.namePlaceholder}
            />
          </label>

          <label>
            {EXPENSE_FORM.amountLabel}
            <input
              required
              type="number"
              min={MIN_EXPENSE_AMOUNT}
              step={MIN_EXPENSE_AMOUNT}
              value={amount}
              disabled={isSubmitting}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
              placeholder={EXPENSE_FORM.amountPlaceholder}
            />
          </label>

          <label>
            {EXPENSE_FORM.categoryLabel}
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Sans catégorie</option>
              {categories.map((category) => (
                <option key={category.cat_id} value={category.cat_id}>
                  {category.cat_name}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="dashboard-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="dashboard-expense-form__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {EXPENSE_FORM.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Check size={17} aria-hidden="true" />
              {isSubmitting ? "Enregistrement…" : EXPENSE_FORM.submit}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
