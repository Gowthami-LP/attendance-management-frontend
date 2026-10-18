import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "../auth/context";
import TenantSelectionPage from "./TenantSelectionPage";

describe("TenantSelectionPage", () => {
  it("selects an accessible active tenant and continues to the dashboard", () => {
    const selectTenant = vi.fn();
    const context: AuthContextValue = {
      admin: { email: "admin@example.com", role: "admin" },
      tenants: [
        { id: "tenant-acme", name: "Acme", slug: "acme", status: "active" },
        { id: "tenant-north", name: "North", slug: "north", status: "active" },
        {
          id: "tenant-paused",
          name: "Paused",
          slug: "paused",
          status: "suspended",
        },
      ],
      activeTenantId: null,
      login: vi.fn(),
      selectTenant,
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={context}>
        <MemoryRouter initialEntries={["/select-tenant"]}>
          <Routes>
            <Route path="/select-tenant" element={<TenantSelectionPage />} />
            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(screen.getByRole("button", { name: "Acme" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "North" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Paused" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Acme" }));

    expect(selectTenant).toHaveBeenCalledWith("tenant-acme");
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });
});
