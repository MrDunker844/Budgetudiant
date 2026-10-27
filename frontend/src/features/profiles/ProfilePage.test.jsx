import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProfilePage from "./ProfilePage.jsx";
import { changePassword, updateUser } from "../../services/api.js";

// On remplace les appels réseau par de fausses fonctions qu'on contrôle
vi.mock("../../services/api.js", () => ({
  changePassword: vi.fn(),
  updateUser: vi.fn(),
}));

const USER = {
  us_id: 1,
  us_name: "Alice Martin",
  us_email: "alice@example.com",
  us_monthly_budget: 850,
  us_created_at: "2026-10-27T10:00:00",
};

function renderPage(props = {}) {
  const handlers = { onUserUpdated: vi.fn(), onBack: vi.fn() };
  render(<ProfilePage user={USER} {...handlers} {...props} />);
  return handlers;
}

async function fillPasswordForm({
  current = "old-password-123",
  next = "new-password-456",
  confirm = next,
} = {}) {
  await userEvent.type(screen.getByLabelText("Ancien mot de passe"), current);
  await userEvent.type(screen.getByLabelText(/^Nouveau mot de passe/), next);
  await userEvent.type(screen.getByLabelText("Confirmer le nouveau mot de passe"), confirm);
  await userEvent.click(screen.getByRole("button", { name: "Changer mon mot de passe" }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProfilePage — informations", () => {
  it("R2 : affiche et enregistre le nom et l'e-mail modifiés", async () => {
    updateUser.mockResolvedValue({ ...USER, us_name: "Alice M." });
    renderPage();

    const nameInput = screen.getByLabelText("Nom et prénom");
    expect(nameInput).toHaveValue("Alice Martin");
    expect(screen.getByLabelText("Adresse e-mail")).toHaveValue("alice@example.com");

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Alice M.");
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer mes informations" }));

    expect(updateUser).toHaveBeenCalledWith(1, {
      us_name: "Alice M.",
      us_email: "alice@example.com",
      us_monthly_budget: 850,
    });
  });

  it("R3 : enregistre le revenu mensuel saisi", async () => {
    updateUser.mockResolvedValue({ ...USER, us_monthly_budget: 1200.5 });
    renderPage();

    const incomeInput = screen.getByLabelText(/Revenu mensuel/);
    expect(incomeInput).toHaveValue(850);
    await userEvent.clear(incomeInput);
    await userEvent.type(incomeInput, "1200.5");
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer mes informations" }));

    expect(updateUser.mock.calls[0][1].us_monthly_budget).toBe(1200.5);
  });

  it("R3 : un revenu vide est envoyé comme null (pas défini)", async () => {
    updateUser.mockResolvedValue({ ...USER, us_monthly_budget: null });
    renderPage();

    await userEvent.clear(screen.getByLabelText(/Revenu mensuel/));
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer mes informations" }));

    expect(updateUser.mock.calls[0][1].us_monthly_budget).toBeNull();
  });

  it("R3 : refuse un revenu à zéro sans appeler l'API", async () => {
    renderPage();

    const incomeInput = screen.getByLabelText(/Revenu mensuel/);
    // Le navigateur bloquerait déjà (min) : on vérifie aussi notre propre message
    incomeInput.removeAttribute("min");
    await userEvent.clear(incomeInput);
    await userEvent.type(incomeInput, "0");
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer mes informations" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("supérieur à zéro");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("R2 : affiche l'erreur de l'API (e-mail déjà utilisé)", async () => {
    updateUser.mockRejectedValue(new Error("E-mail déjà utilisé"));
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Enregistrer mes informations" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail déjà utilisé");
  });

  it("R10 : confirme l'enregistrement et transmet le nouvel utilisateur", async () => {
    const updated = { ...USER, us_name: "Bob Durand" };
    updateUser.mockResolvedValue(updated);
    const { onUserUpdated } = renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Enregistrer mes informations" }));

    expect(await screen.findByRole("status")).toHaveTextContent("enregistrées");
    expect(onUserUpdated).toHaveBeenCalledWith(updated);
  });

  it("R11 : enregistrer ses informations n'envoie pas de mot de passe", async () => {
    updateUser.mockResolvedValue(USER);
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Enregistrer mes informations" }));

    expect(changePassword).not.toHaveBeenCalled();
    expect(Object.keys(updateUser.mock.calls[0][1])).not.toContain("password");
  });
});

describe("ProfilePage — mot de passe", () => {
  it("R8 : envoie l'ancien et le nouveau mot de passe puis vide le formulaire", async () => {
    changePassword.mockResolvedValue(null);
    renderPage();

    await fillPasswordForm();

    expect(changePassword).toHaveBeenCalledWith({
      current_password: "old-password-123",
      new_password: "new-password-456",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("modifié");
    expect(screen.getByLabelText("Ancien mot de passe")).toHaveValue("");
  });

  it("R8 : refuse une confirmation différente sans appeler l'API", async () => {
    renderPage();

    await fillPasswordForm({ confirm: "something-else-789" });

    expect(await screen.findByRole("alert")).toHaveTextContent("ne correspondent pas");
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("R8 : refuse un nouveau mot de passe de moins de 12 caractères", async () => {
    renderPage();

    // Le navigateur bloquerait déjà (minLength) : on vérifie aussi notre propre message
    screen.getByLabelText(/^Nouveau mot de passe/).removeAttribute("minLength");
    await fillPasswordForm({ next: "short" });

    expect(await screen.findByRole("alert")).toHaveTextContent("au moins 12");
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("R8 : affiche l'erreur si l'ancien mot de passe est faux", async () => {
    changePassword.mockRejectedValue(new Error("L'ancien mot de passe est incorrect."));
    renderPage();

    await fillPasswordForm();

    expect(await screen.findByRole("alert")).toHaveTextContent("incorrect");
  });

  it("R11 : changer le mot de passe ne modifie pas les informations", async () => {
    changePassword.mockResolvedValue(null);
    renderPage();

    await fillPasswordForm();

    expect(updateUser).not.toHaveBeenCalled();
  });
});

describe("ProfilePage — navigation", () => {
  it("R10 : le bouton retour ramène au tableau de bord", async () => {
    const { onBack } = renderPage();

    await userEvent.click(screen.getByRole("button", { name: /Retour au tableau de bord/ }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("R10 : affiche les initiales de l'utilisateur", () => {
    renderPage();
    expect(screen.getByText("AM")).toBeInTheDocument();
  });
});
