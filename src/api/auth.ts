import apiClient from "./client";
import type { AdminUser, LoginRequest, TokenResponse } from "../types/auth";

export async function loginUser(
  credentials: LoginRequest,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    "/api/v1/auth/admin/login",
    credentials,
  );

  return response.data;
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  const response = await apiClient.get<AdminUser>("/api/v1/auth/admin/me");
  return response.data;
}
