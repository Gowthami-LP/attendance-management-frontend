import axios from "axios";
import {
  getAccessToken,
  getActiveTenantId,
  notifyUnauthorized,
} from "./token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/backend-api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const tenantId = getActiveTenantId();
  if (tenantId) {
    config.headers.set("X-Tenant-ID", tenantId);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.endsWith("/login")
    ) {
      notifyUnauthorized();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
