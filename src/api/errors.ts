import axios from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const status = error.response?.status;
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (!status) {
    return "The server could not be reached. Check your connection and try again.";
  }

  const detail: unknown = error.response?.data?.detail;
  if (status < 500 && typeof detail === "string") {
    return detail;
  }
  if (status === 422 && Array.isArray(detail)) {
    const messages = detail
      .map((item: { msg?: unknown; loc?: unknown }) => {
        const field = Array.isArray(item.loc) ? item.loc.at(-1) : undefined;
        const message = typeof item.msg === "string" ? item.msg : undefined;
        return field && message ? `${String(field)}: ${message}` : message;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length) {
      return messages.join(" ");
    }
  }

  return fallback;
}
