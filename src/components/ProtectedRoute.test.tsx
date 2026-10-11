import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  it("redirects signed-out users to the login route", () => {
    render(
      <MemoryRouter initialEntries={["/employees"]}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/employees" element={<p>Private employee list</p>} />
            </Route>
            <Route path="/login" element={<h1>Sign in</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByText("Private employee list")).not.toBeInTheDocument();
  });
});
