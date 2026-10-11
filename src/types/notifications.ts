export type NotificationStatus = "pending" | "sending" | "sent" | "failed";

export interface NotificationRecord {
  notification_id: string;
  employee_id: string;
  recipient_email: string;
  week_start: string;
  week_end: string;
  subject: string;
  status: NotificationStatus;
  attempts: number;
  created_at: string;
  sent_at: string | null;
  last_error: string | null;
}

export interface TriggerNotificationsResult {
  week_start: string;
  week_end: string;
  created: number;
  sent: number;
  failed: number;
  skipped: number;
}

export interface RetryNotificationResult {
  notification_id: string;
  status: NotificationStatus | "not_found";
  message?: string;
}
