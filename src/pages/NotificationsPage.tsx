import { useEffect, useState } from "react";
import {
  getNotifications,
  retryNotification,
  triggerWeeklyNotifications,
} from "../api/notifications";
import { getErrorMessage } from "../api/errors";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import type { NotificationRecord, NotificationStatus } from "../types/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [status, setStatus] = useState<"all" | NotificationStatus>("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function loadNotifications(selectedStatus: "all" | NotificationStatus = status) {
    setError("");
    setLoading(true);
    try {
      setNotifications(await getNotifications(selectedStatus === "all" ? undefined : selectedStatus));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load notification history."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchNotifications() {
      try {
        const result = await getNotifications();
        if (active) {
          setNotifications(result);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Unable to load notification history."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchNotifications();
    return () => {
      active = false;
    };
  }, []);

  async function handleFilterChange(nextStatus: "all" | NotificationStatus) {
    setStatus(nextStatus);
    await loadNotifications(nextStatus);
  }

  async function handleTrigger() {
    if (!window.confirm("Send weekly violation notifications for the previous completed week?")) {
      return;
    }

    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const result = await triggerWeeklyNotifications();
      setFeedback(
        `Week ${result.week_start}–${result.week_end}: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped.`,
      );
      await loadNotifications();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to trigger weekly notifications."));
    } finally {
      setBusy(false);
    }
  }

  async function handleRetry(notification: NotificationRecord) {
    if (!window.confirm(`Retry the notification to ${notification.recipient_email}?`)) {
      return;
    }

    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const result = await retryNotification(notification.notification_id);
      setFeedback(result.message ?? `Notification status: ${result.status}.`);
      await loadNotifications();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to retry this notification."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Delivery</p>
          <h2>Notifications</h2>
          <p className="muted">Review notification delivery history and retry failed messages.</p>
        </div>
        <button className="button button-primary" disabled={busy} onClick={() => void handleTrigger()} type="button">
          {busy ? "Working..." : "Send weekly notifications"}
        </button>
      </div>

      <p className="notice">
        Weekly notifications use the backend's completed-week compliance results. The service applies its policy and
        delivery rules; this screen does not calculate recipients or compliance.
      </p>
      {error && <ErrorMessage message={error} />}
      {feedback && <p className="success-message" role="status">{feedback}</p>}

      <div className="toolbar panel">
        <label>
          Delivery status
          <select
            value={status}
            onChange={(event) => void handleFilterChange(event.target.value as "all" | NotificationStatus)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <button className="button button-secondary" onClick={() => void loadNotifications()} type="button">
          Refresh
        </button>
      </div>

      {loading ? (
        <Loading message="Loading notifications..." />
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Notification ID</th>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Week</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.notification_id}>
                  <td>{notification.notification_id}</td>
                  <td>{notification.recipient_email}</td>
                  <td>{notification.subject}</td>
                  <td>{notification.week_start} – {notification.week_end}</td>
                  <td>
                    <span className={`status-pill status-${notification.status}`}>
                      {notification.status}
                    </span>
                  </td>
                  <td>{notification.attempts}</td>
                  <td>{new Date(notification.created_at).toLocaleString()}</td>
                  <td>
                    {notification.status === "failed" ? (
                      <button
                        className="button button-quiet"
                        disabled={busy}
                        onClick={() => void handleRetry(notification)}
                        type="button"
                      >
                        Retry
                      </button>
                    ) : "—"}
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr><td className="empty-cell" colSpan={8}>No notifications found.</td></tr>
              )}
            </tbody>
          </table>
          <p className="table-note">
            The backend may return private delivery error details; they are intentionally not shown here.
          </p>
        </div>
      )}
    </section>
  );
}
