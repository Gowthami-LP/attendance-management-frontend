import apiClient from "./client";
import type { Tenant } from "../types/auth";

export async function getTenants(): Promise<Tenant[]> {
  const response = await apiClient.get<Tenant[]>("/api/v1/tenants");
  return response.data;
}
