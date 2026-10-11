import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import DashboardPage from "./DashboardPage";

describe("DashboardPage", () => {
  it("shows navigation to the main attendance tools", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.find((link) => link.getAttribute("href") === "/employees")).toBeInTheDocument();
    expect(links.find((link) => link.getAttribute("href") === "/attendance")).toBeInTheDocument();
  });
});
