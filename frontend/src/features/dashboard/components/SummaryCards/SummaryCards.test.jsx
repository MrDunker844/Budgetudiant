import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SummaryCards from "./SummaryCards.jsx";

const SUMMARY = {
  budget_mensuel: 850,
  total_revenus: 950,
  total_depenses: 300,
  solde: 650,
  depenses_par_categorie: [],
};

// Les espaces des montants formatés en fr-FR sont insécables : on les normalise
function normalized(text) {
  return text.replace(/\s/g, " ");
}

describe("SummaryCards", () => {
  it("R5 : les revenus du mois incluent le revenu mensuel et le précisent", () => {
    render(<SummaryCards summary={SUMMARY} />);

    const card = screen.getByText("Revenus du mois").closest("article");
    expect(normalized(card.textContent)).toContain("950,00 €");
    expect(normalized(card.textContent)).toContain("Dont 850,00 € de revenu mensuel");
  });

  it("R5 : le solde affiché est celui de l'API (revenus du mois moins dépenses)", () => {
    render(<SummaryCards summary={SUMMARY} />);

    const card = screen.getByText("Solde du mois").closest("article");
    expect(normalized(card.textContent)).toContain("650,00 €");
  });

  it("R12 : sans revenu mensuel, la légende reste « revenus enregistrés »", () => {
    render(<SummaryCards summary={{ ...SUMMARY, budget_mensuel: null, total_revenus: 100 }} />);

    expect(screen.getByText("Revenus enregistrés ce mois-ci")).toBeInTheDocument();
  });
});
