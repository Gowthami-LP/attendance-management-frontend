import apiClient from "./client";
import type {
  NotificationRecord,
  NotificationStatus,
  RetryNotificationResult,
  TriggerNotificationsResult,
} from "../types/notifications";

export async function getNotifications(
  status?: NotificationStatus,
): Promise<NotificationRecord[]> {
  const response = await apiClient.get<NotificationRecord[]>(
    "/api/v1/notifications",
    { params: status ? { status } : undefined },
  );

  return response.data;
}

export async function triggerWeeklyNotifications(): Promise<TriggerNotificationsResult> {
  const response = await apiClient.post<TriggerNotificationsResult>(
    "/api/v1/notifications/weekly-violations",
  );

  return response.data;
}

export async function retryNotification(
  notificationId: string,
): Promise<RetryNotificationResult> {
  const response = await apiClient.post<RetryNotificationResult>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}/retry`,
  );

  return response.data;
}
