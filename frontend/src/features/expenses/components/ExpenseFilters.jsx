import Input from "../../../shared/ui/Input/Input.jsx";
import Select from "../../../shared/ui/Select/Select.jsx";
import Button from "../../../shared/ui/Button/Button.jsx";
import { RotateCcw, Search } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../expenses.js";
import "./ExpenseFilters.css";

export default function ExpenseFilters({ filters, onChange, onReset }) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    filters.period !== "all";

  function change(event) {
    onChange({ ...filters, [event.target.name]: event.target.value });
  }

  return (
    <div className="expense-filters-scroll">
      <div className="expense-filters" aria-label="Filtres des dépenses">
        <label className="expense-filter expense-filter--search">
          <span className="expense-filter__label">Rechercher</span>
          <span className="expense-filter__search-control">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Rechercher une dépense</span>
            <Input
              name="search"
              value={filters.search}
              onChange={change}
              placeholder="Libellé ou catégorie"
            />
          </span>
        </label>
        <label className="expense-filter">
          <span className="expense-filter__label">Catégorie</span>
          <Select
            name="category"
            value={filters.category}
            onChange={change}
            options={EXPENSE_CATEGORIES.map((category) => ({
              value: String(category.id),
              label: category.name,
            }))}
            placeholder="Toutes les catégories"
          />
        </label>
        <label className="expense-filter">
          <span className="expense-filter__label">Période</span>
          <Select
            className="expense-filter__select"
            name="period"
            value={filters.period}
            onChange={change}
            options={[
              { value: "all", label: "Toutes les dates" },
              { value: "month", label: "Ce mois-ci" },
              { value: "30days", label: "30 derniers jours" },
            ]}
          />
        </label>
        <Button
          className="expense-filters__reset"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
