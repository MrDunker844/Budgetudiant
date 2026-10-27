// Ajoute des vérifications lisibles comme expect(element).toBeInTheDocument()
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vide la page simulée après chaque test
afterEach(() => {
  cleanup();
});
