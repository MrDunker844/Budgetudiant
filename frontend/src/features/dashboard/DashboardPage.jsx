
import { useMemo, useState } from "react";

import Header from "../../shared/header/Header.jsx";
import Sidebar from "../../shared/sidebar/Sidebar.jsx";
import DashboardWelcome from "./components/DashboardWelcome/DashboardWelcome.jsx";
import SummaryCards from "./components/SummaryCards/SummaryCards.jsx";
import ExpenseCategories from "./components/ExpenseCategories/ExpenseCategories.jsx";
import WeeklyChart from "./components/WeeklyChart/WeeklyChart.jsx";
import RecentTransactions from "./components/RecentTransactions/RecentTransactions.jsx";
import AddExpenseModal from "./components/AddExpenseModal/AddExpenseModal.jsx";
import SectionPlaceholder from "./components/SectionPlaceholder/SectionPlaceholder.jsx";

import {
  DASHBOARD_CONFIG,
  DASHBOARD_LABELS,
  DASHBOARD_SECTIONS,
  INITIAL_TRANSACTIONS,
  WEEKLY_EXPENSES,
} from "./dashboard.js";

import {
  getExpenseCategories,
  getExpensesTotal,
} from "./utils/dashboardCalculations.js";
import { getInitials } from "./utils/dashboardFormatters.js";

import "./DashboardPage.css";

export default function DashboardPage({
  user = {},
  onLogout = () => {},
}) {
  const [activeSection, setActiveSection] = useState(
    DASHBOARD_SECTIONS.OVERVIEW
  );

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  const expensesTotal = useMemo(
    () => getExpensesTotal(transactions),
    [transactions]
  );

  const remaining = DASHBOARD_CONFIG.monthlyBudget - expensesTotal;

  const categories = useMemo(
    () => getExpenseCategories(transactions),
    [transactions]
  );
  const profileName = [user?.firstname, user?.lastname]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  function handleOpenExpenseModal() {
    setShowExpenseModal(true);
  }

  function handleCloseExpenseModal() {
    setShowExpenseModal(false);
  }

  function handleAddExpense(expense) {
    setTransactions((currentTransactions) => [
      expense,
      ...currentTransactions,
    ]);

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

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onLogout={onLogout}
      />

      <main className="dashboard-main">
        <Header
          period={DASHBOARD_CONFIG.period}
          workspaceLabel="Mon espace"
          title="Vue d'ensemble"
          profileLabel={DASHBOARD_LABELS.profile}
          profileName={profileName}
          profileInitials={getInitials(user?.firstname, user?.lastname)}
          addExpenseLabel={DASHBOARD_LABELS.addExpense}
          onAddExpense={handleOpenExpenseModal}
        />

        <div className="dashboard-content">
          <DashboardWelcome
            user={user}
            onAddExpense={handleOpenExpenseModal}
          />

          {isOverview ? (
            <>
              <SummaryCards
                expensesTotal={expensesTotal}
                remaining={remaining}
              />

              <section className="dashboard-charts-grid">
                <ExpenseCategories
                  categories={categories}
                  expensesTotal={expensesTotal}
                />

                <WeeklyChart weeks={WEEKLY_EXPENSES} />
              </section>

              <RecentTransactions
                transactions={transactions}
                search={search}
                onSearchChange={setSearch}
                onViewAll={handleViewAllExpenses}
              />
            </>
          ) : (
            <SectionPlaceholder activeSection={activeSection} />
          )}

          <p className="dashboard-demo-notice">
            {DASHBOARD_LABELS.demoNotice}
          </p>
        </div>
      </main>

      {showExpenseModal && (
        <AddExpenseModal
          onClose={handleCloseExpenseModal}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  );
}
