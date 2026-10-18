import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentAdmin, loginUser } from "../api/auth";
import { getTenants } from "../api/tenants";
import { setAccessToken, setActiveTenantId } from "../api/token";
import type { AdminUser, LoginRequest, Tenant } from "../types/auth";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantIdState] = useState<string | null>(null);

  const logout = useCallback(() => {
    setAccessToken(null);
    setActiveTenantId(null);
    setAdmin(null);
    setTenants([]);
    setActiveTenantIdState(null);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setAccessToken(null);
    setActiveTenantId(null);
    setActiveTenantIdState(null);
    setAdmin(null);
    setTenants([]);
    try {
      const tokenResponse = await loginUser(credentials);
      setAccessToken(tokenResponse.access_token);
      const currentAdmin = await getCurrentAdmin();
      const availableTenants = await getTenants();
      const activeTenants = availableTenants.filter(
        (tenant) => tenant.status === "active",
      );

      setTenants(availableTenants);
      setAdmin(currentAdmin);
      if (activeTenants.length === 1) {
        setActiveTenantId(activeTenants[0].id);
        setActiveTenantIdState(activeTenants[0].id);
      }
    } catch (error) {
      setAccessToken(null);
      setActiveTenantId(null);
      throw error;
    }
  }, []);

  const selectTenant = useCallback(
    (tenantId: string) => {
      const tenant = tenants.find(
        (candidate) => candidate.id === tenantId && candidate.status === "active",
      );
      if (!tenant) {
        throw new Error("Select an active tenant available to this account.");
      }

      setActiveTenantId(tenant.id);
      setActiveTenantIdState(tenant.id);
    },
    [tenants],
  );

  useEffect(() => {
    window.addEventListener("attendance:unauthorized", logout);
    return () => window.removeEventListener("attendance:unauthorized", logout);
  }, [logout]);

  const value = useMemo(
    () => ({ admin, tenants, activeTenantId, login, selectTenant, logout }),
    [admin, tenants, activeTenantId, login, selectTenant, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
