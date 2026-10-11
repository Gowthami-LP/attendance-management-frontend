let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function notifyUnauthorized(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("attendance:unauthorized"));
  }
}
