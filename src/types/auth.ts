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
  policy?: {
    min_qualifying_days: number;
    min_hours_per_day: number;
    min_weekly_hours: number;
  };
  created_at?: string | null;
}
