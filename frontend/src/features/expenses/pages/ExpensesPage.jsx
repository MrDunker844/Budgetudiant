import { useEffect, useMemo, useState } from "react";
import Button from "../../../shared/ui/Button/Button.jsx";
import Card from "../../../shared/ui/Card/Card.jsx";
import Modal from "../../../shared/ui/Modal/Modal.jsx";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner/LoadingSpinner.jsx";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseFilters from "../components/ExpenseFilters.jsx";
import ExpenseTable from "../components/ExpenseTable.jsx";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../expenses.js";
import { formatMoney } from "../components/ExpenseRow.jsx";
import "./ExpensesPage.css";

const emptyFilters = { search: "", category: "", period: "all" };

export default function ExpensesPage({ user, categories = [], onExpensesChanged }) {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function refreshExpenses() {
    setLoading(true);
    setLoadError("");
    try {
      setExpenses(await getExpenses(user.us_id, categories));
    } catch (error) {
      setLoadError(error.message || "Impossible de charger les dépenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshExpenses();
  }, [user.us_id, categories]);

  const visibleExpenses = useMemo(() => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-01`;
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const threshold = [
      thirtyDaysAgo.getFullYear(),
      String(thirtyDaysAgo.getMonth() + 1).padStart(2, "0"),
      String(thirtyDaysAgo.getDate()).padStart(2, "0"),
    ].join("-");

    return expenses.filter((expense) => {
      const search = filters.search.trim().toLocaleLowerCase("fr-FR");
      const matchesSearch =
        !search ||
        `${expense.description} ${expense.category}`
          .toLocaleLowerCase("fr-FR")
          .includes(search);
      const matchesCategory =
        !filters.category ||
        String(expense.category_id) === filters.category;
      const matchesPeriod =
        filters.period === "all" ||
        (filters.period === "month"
          ? expense.date >= monthStart
          : expense.date >= threshold);

      return matchesSearch && matchesCategory && matchesPeriod;
    });
  }, [expenses, filters]);

  const total = visibleExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );
  const latestExpense = [...visibleExpenses].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];

  function openCreate() {
    setEditingExpense(null);
    setModalOpen(true);
  }

  async function handleSave(values) {
    setSaving(true);
    try {
      if (editingExpense) {
        await updateExpense(user.us_id, editingExpense.id, values);
      } else {
        await createExpense(user.us_id, values);
      }
      await refreshExpenses();
      onExpensesChanged?.();
      setModalOpen(false);
      setNotice(editingExpense ? "Dépense modifiée." : "Dépense ajoutée.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id);
      await refreshExpenses();
      onExpensesChanged?.();
      setNotice("Dépense supprimée.");
      setDeleteTarget(null);
    } catch (error) {
      setNotice(error.message || "Impossible de supprimer cette dépense.");
    }
  }

  return (
    <section className="expenses-page">
      <div className="expenses-page__heading">
        <div>
          <p className="expenses-page__eyebrow">GESTION DU BUDGET</p>
          <h1>Mes dépenses</h1>
          <p className="expenses-page__subtitle">
            Garde un œil sur tes dépenses et maîtrise ton budget.
          </p>
        </div>
        <Button onClick={openCreate}>
          <span aria-hidden="true">＋</span> Ajouter une dépense
        </Button>
      </div>

      {notice && (
        <div className="expenses-page__notice" role="status">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Fermer le message"
          >
            ×
          </button>
        </div>
      )}

      <div className="expenses-summary">
        <Card className="expenses-summary__card">
          <span className="expenses-summary__label">Total affiché</span>
          <strong>{formatMoney(total)}</strong>
          <small>{visibleExpenses.length} opération(s)</small>
        </Card>
        <Card className="expenses-summary__card">
          <span className="expenses-summary__label">Dépense moyenne</span>
          <strong>
            {formatMoney(
              visibleExpenses.length ? total / visibleExpenses.length : 0,
            )}
          </strong>
          <small>Par opération affichée</small>
        </Card>
        <Card className="expenses-summary__card">
          <span className="expenses-summary__label">Dernière dépense</span>
          <strong>{formatMoney(latestExpense?.amount ?? 0)}</strong>
          <small>{latestExpense?.description ?? "Aucune opération"}</small>
        </Card>
      </div>

      <Card className="expenses-list-card">
        <div className="expenses-list-card__heading">
          <div>
            <h2>Historique des dépenses</h2>
            <p>Retrouve et gère toutes tes opérations.</p>
          </div>
          <span className="expenses-list-card__count">
            {visibleExpenses.length} résultat(s)
          </span>
        </div>

        <div className="expenses-list-card__filters">
          <ExpenseFilters
            filters={filters}
            categories={categories}
            onChange={setFilters}
            onReset={() => setFilters(emptyFilters)}
          />
        </div>

        <div className="expenses-list-card__table">
          {loading ? (
            <LoadingSpinner label="Chargement des dépenses…" />
          ) : loadError ? (
            <div className="expenses-page__error" role="alert">
              <p>{loadError}</p>
              <Button variant="secondary" onClick={refreshExpenses}>
                Réessayer
              </Button>
            </div>
          ) : (
            <ExpenseTable
              expenses={visibleExpenses}
              onEdit={(expense) => {
                setEditingExpense(expense);
                setModalOpen(true);
              }}
              onDelete={setDeleteTarget}
              onAdd={openCreate}
            />
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editingExpense ? "Modifier la dépense" : "Ajouter une dépense"}
        onClose={() => !saving && setModalOpen(false)}
      >
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          saving={saving}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer cette dépense ?"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      >
        <p>
          Cette action supprimera « {deleteTarget?.description} » de la liste.
        </p>
      </Modal>
    </section>
  );
}
