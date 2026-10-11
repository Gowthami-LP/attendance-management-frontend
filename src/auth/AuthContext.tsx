import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentAdmin, loginUser } from "../api/auth";
import { setAccessToken } from "../api/token";
import type { AdminUser, LoginRequest } from "../types/auth";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const logout = useCallback(() => {
    setAccessToken(null);
    setAdmin(null);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const tokenResponse = await loginUser(credentials);
    setAccessToken(tokenResponse.access_token);

    try {
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
    } catch (error) {
      setAccessToken(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("attendance:unauthorized", logout);
    return () => window.removeEventListener("attendance:unauthorized", logout);
  }, [logout]);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
