import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App.jsx";
import { getCurrentUser } from "./services/api.js";

vi.mock("./services/api.js", () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  getCategories: vi.fn().mockResolvedValue([]),
  getExpenses: vi.fn().mockResolvedValue([]),
  getIncomes: vi.fn().mockResolvedValue([]),
  getUserSummary: vi.fn().mockResolvedValue({
    budget_mensuel: null,
    total_revenus: 0,
    total_depenses: 0,
    solde: 0,
    depenses_par_categorie: [],
  }),
  createExpense: vi.fn(),
  changePassword: vi.fn(),
  updateUser: vi.fn(),
}));

const USER = {
  us_id: 1,
  us_name: "Alice Martin",
  us_email: "alice@example.com",
  us_monthly_budget: null,
  us_created_at: "2026-10-27T10:00:00",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App — page Profil", () => {
  it("R1 : cliquer sur l'avatar du dashboard ouvre /profile", async () => {
    getCurrentUser.mockResolvedValue(USER);
    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "Mon profil" }));

    expect(window.location.pathname).toBe("/profile");
    expect(await screen.findByRole("heading", { name: "Mon profil" })).toBeInTheDocument();
  });

  it("R9 : /profile renvoie vers /login si on n'est pas connecté", async () => {
    const unauthorized = Object.assign(new Error("Connecte-toi"), { status: 401 });
    getCurrentUser.mockRejectedValue(unauthorized);
    window.history.pushState({}, "", "/profile");
    render(<App />);

    await waitFor(() => expect(window.location.pathname).toBe("/login"));
  });
});
