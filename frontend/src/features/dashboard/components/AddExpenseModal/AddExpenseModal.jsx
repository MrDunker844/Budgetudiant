
import { useState } from "react";
import { Check, X } from "lucide-react";

import Button from "../../../../shared/ui/Button/Button.jsx";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_FORM,
} from "../../dashboard.js";
import "./AddExpenseModal.css";

const MIN_EXPENSE_AMOUNT = 0.01;
const AMOUNT_DECIMAL_PLACES = 2;
const MAX_EXPENSE_LABEL_LENGTH = 80;

export default function AddExpenseModal({ onClose, onAdd }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(
    EXPENSE_CATEGORIES[0]?.id ?? "other"
  );
  const [error, setError] = useState("");

  function handleSubmit(event) {
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

    onAdd({
      id: crypto.randomUUID(),
      label: label.trim(),
      categoryId,
      date: new Date().toISOString().slice(0, 10),
      amount: Number(parsedAmount.toFixed(AMOUNT_DECIMAL_PLACES)),
      type: "expense",
    });
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
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
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
            <Button type="button" variant="secondary" onClick={onClose}>
              {EXPENSE_FORM.cancel}
            </Button>
            <Button type="submit">
              <Check size={17} aria-hidden="true" />
              {EXPENSE_FORM.submit}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
