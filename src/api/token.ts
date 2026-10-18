let accessToken: string | null = null;
let activeTenantId: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getActiveTenantId(): string | null {
  return activeTenantId;
}

export function setActiveTenantId(tenantId: string | null): void {
  activeTenantId = tenantId;
}

export function notifyUnauthorized(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("attendance:unauthorized"));
  }
}
