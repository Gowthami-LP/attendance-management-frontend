export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AdminUser {
  email: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "deactivated";
}
