import { useEffect, useMemo, useState } from "react";

import {
  createExpense,
  getCategories,
  getExpenses,
  getIncomes,
  getUserSummary,
} from "../../services/api.js";
import Header from "../../shared/header/Header.jsx";
import Sidebar from "../../shared/sidebar/Sidebar.jsx";
import DashboardWelcome from "./components/DashboardWelcome/DashboardWelcome.jsx";
import SummaryCards from "./components/SummaryCards/SummaryCards.jsx";
import ExpenseCategories from "./components/ExpenseCategories/ExpenseCategories.jsx";
import WeeklyChart from "./components/WeeklyChart/WeeklyChart.jsx";
import RecentTransactions from "./components/RecentTransactions/RecentTransactions.jsx";
import AddExpenseModal from "./components/AddExpenseModal/AddExpenseModal.jsx";
import SectionPlaceholder from "./components/SectionPlaceholder/SectionPlaceholder.jsx";
import ExpensesPage from "../expenses/pages/ExpensesPage.jsx";

import { DASHBOARD_NAVIGATION, DASHBOARD_SECTIONS } from "./dashboard.js";
import {
  getExpenseCategories,
  getWeeklyExpenses,
} from "./utils/dashboardCalculations.js";
import { getInitials } from "./utils/dashboardFormatters.js";

import "./DashboardPage.css";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));

  return `${formatted.charAt(0).toLocaleUpperCase("fr-FR")}${formatted.slice(1)}`;
}

function mapTransactions(expenses, incomes) {
  const expenseTransactions = expenses.map((expense) => ({
    id: `expense-${expense.ex_id}`,
    label: expense.ex_title,
    categoryId: expense.categorie_id,
    date: expense.ex_date,
    amount: Number(expense.ex_amount),
    type: "expense",
  }));
  const incomeTransactions = incomes.map((income) => ({
    id: `income-${income.inc_id}`,
    label: income.inc_title,
    categoryId: income.categorie_id,
    date: income.inc_date,
    amount: Number(income.inc_amount),
    type: "income",
  }));

  return [...expenseTransactions, ...incomeTransactions].sort(
    (first, second) =>
      second.date.localeCompare(first.date) ||
      second.id.localeCompare(first.id)
  );
}

export default function DashboardPage({
  user,
  onLogout,
  logoutError = "",
}) {
  const month = getCurrentMonth();
  const [activeSection, setActiveSection] = useState(
    DASHBOARD_SECTIONS.OVERVIEW
  );
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getCategories({ signal: controller.signal })
      .then(setCategories)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const [summary, expenses, incomes] = await Promise.all([
          getUserSummary(user.us_id, month, { signal: controller.signal }),
          getExpenses(user.us_id, month, { signal: controller.signal }),
          getIncomes(user.us_id, month, { signal: controller.signal }),
        ]);
        setDashboardData({
          requestKey: `${user.us_id}:${month}:${refreshVersion}`,
          summary,
          transactions: mapTransactions(expenses, incomes),
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, [user.us_id, month, refreshVersion]);

  const requestKey = `${user.us_id}:${month}:${refreshVersion}`;
  const isLoading = !error && dashboardData?.requestKey !== requestKey;
  const profileName = user.us_name;
  const nameParts = profileName.trim().split(/\s+/);
  const profileInitials = getInitials(
    nameParts[0],
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
  );
  const expenseCategories = useMemo(
    () =>
      dashboardData
        ? getExpenseCategories(dashboardData.transactions, categories)
        : [],
    [dashboardData, categories]
  );
  const weeklyExpenses = useMemo(
    () =>
      dashboardData
        ? getWeeklyExpenses(dashboardData.transactions, month)
        : [],
    [dashboardData, month]
  );

  function handleOpenExpenseModal() {
    setShowExpenseModal(true);
  }

  function handleCloseExpenseModal() {
    setShowExpenseModal(false);
  }

  async function handleAddExpense(expense) {
    await createExpense({
      ...expense,
      user_id: user.us_id,
    });
    setRefreshVersion((currentVersion) => currentVersion + 1);
    handleCloseExpenseModal();
    setSearch("");
    setActiveSection(DASHBOARD_SECTIONS.OVERVIEW);
  }

  function handleNavigate(section) {
    setActiveSection(section);
    setSearch("");
  }

  function handleViewAllExpenses() {
    handleNavigate(DASHBOARD_SECTIONS.EXPENSES);
  }

  const isOverview = activeSection === DASHBOARD_SECTIONS.OVERVIEW;
  const activeSectionLabel = DASHBOARD_NAVIGATION.find(
    (section) => section.id === activeSection
  )?.label ?? "Vue d'ensemble";

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        profileName={profileName}
        profileInitials={profileInitials}
      />

      <main className="dashboard-main">
        <Header
          period={formatMonth(month)}
          workspaceLabel="Mon espace"
          title={activeSectionLabel}
        />

        <div className="dashboard-content">
          <DashboardWelcome
            user={user}
            period={formatMonth(month)}
            onAddExpense={handleOpenExpenseModal}
          />

          {logoutError && (
            <p className="dashboard-error" role="alert">
              Impossible de fermer la session : {logoutError}
            </p>
          )}

          {error ? (
            <p className="dashboard-error" role="alert">
              Impossible de charger les données : {error}
            </p>
          ) : isLoading ? (
            <p className="dashboard-status" role="status">
              Chargement de ton espace…
            </p>
          ) : isOverview && dashboardData ? (
            <>
              <SummaryCards summary={dashboardData.summary} />

              <section className="dashboard-charts-grid">
                <ExpenseCategories
                  categories={expenseCategories}
                  expensesTotal={dashboardData.summary.total_depenses}
                />
                <WeeklyChart weeks={weeklyExpenses} />
              </section>

              <RecentTransactions
                transactions={dashboardData.transactions}
                categories={categories}
                search={search}
                onSearchChange={setSearch}
                onViewAll={handleViewAllExpenses}
              />
            </>
          ) : activeSection === DASHBOARD_SECTIONS.EXPENSES && dashboardData ? (
            <ExpensesPage
              user={user}
              categories={categories}
              onExpensesChanged={() =>
                setRefreshVersion((currentVersion) => currentVersion + 1)
              }
            />
          ) : dashboardData ? (
            <SectionPlaceholder activeSection={activeSection} />
          ) : null}
        </div>
      </main>

      {showExpenseModal && (
        <AddExpenseModal
          categories={categories}
          onClose={handleCloseExpenseModal}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  );
}
