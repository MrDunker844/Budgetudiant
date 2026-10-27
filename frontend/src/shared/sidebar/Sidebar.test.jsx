import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Sidebar from "./Sidebar.jsx";

describe("Sidebar", () => {
  it("R1 : l'image de profil est un bouton qui ouvre le profil", async () => {
    const onOpenProfile = vi.fn();
    render(
      <Sidebar
        activeSection="overview"
        onNavigate={vi.fn()}
        onLogout={vi.fn()}
        onOpenProfile={onOpenProfile}
        profileName="Alice Martin"
        profileInitials="AM"
      />
    );

    const profileButton = screen.getByRole("button", { name: "Mon profil" });
    expect(profileButton).toHaveTextContent("AM");

    await userEvent.click(profileButton);
    expect(onOpenProfile).toHaveBeenCalledTimes(1);
  });
});
