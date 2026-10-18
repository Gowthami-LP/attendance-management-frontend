import { createContext } from "react";
import type { AdminUser, LoginRequest, Tenant } from "../types/auth";

export interface AuthContextValue {
  admin: AdminUser | null;
  tenants: Tenant[];
  activeTenantId: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  selectTenant: (tenantId: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
