import { createContext } from "react";
import type { AdminUser, LoginRequest } from "../types/auth";

export interface AuthContextValue {
  admin: AdminUser | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
