import { useEffect, useState } from "react";
import { checkIn, checkOut, getAttendance } from "../api/attendance";
import { getErrorMessage } from "../api/errors";
import { getEmployees } from "../api/employees";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import type { AttendanceRecord } from "../types/attendance";
import type { Employee } from "../types/employee";

function formatTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) {
    return "—";
  }

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEmployees() {
      try {
        const result = await getEmployees({ status: "active" });
        if (active) {
          setEmployees(result);
          setSelectedEmployeeId((current) => current || result[0]?.employee_id || "");
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Unable to load active employees."));
        }
      } finally {
        if (active) {
          setLoadingEmployees(false);
        }
      }
    }

    void loadEmployees();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      if (!selectedEmployeeId) {
        setRecords([]);
        return;
      }

      setLoadingRecords(true);
      setError("");
      try {
        const result = await getAttendance(selectedEmployeeId);
        if (active) {
          setRecords(result);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Unable to load attendance history."));
        }
      } finally {
        if (active) {
          setLoadingRecords(false);
        }
      }
    }

    void loadHistory();
    return () => {
      active = false;
    };
  }, [selectedEmployeeId]);

  async function recordAttendance(action: "check-in" | "check-out") {
    if (!selectedEmployeeId) {
      setError("Select an active employee first.");
      return;
    }

    setBusy(true);
    setError("");
    setFeedback("");
    try {
      if (action === "check-in") {
        await checkIn(selectedEmployeeId);
      } else {
        await checkOut(selectedEmployeeId);
      }
      setFeedback(action === "check-in" ? "Check-in recorded." : "Check-out recorded.");
      setRecords(await getAttendance(selectedEmployeeId));
    } catch (requestError) {
      setError(getErrorMessage(requestError, `Unable to record ${action}.`));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Time tracking</p>
          <h2>Attendance</h2>
          <p className="muted">Record check-in or check-out and review the selected employee's history.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {feedback && <p className="success-message" role="status">{feedback}</p>}

      <div className="panel attendance-actions">
        <label>
          Active employee
          <select
            value={selectedEmployeeId}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
            disabled={loadingEmployees || employees.length === 0}
          >
            {employees.length === 0 && <option value="">No active employees available</option>}
            {employees.map((employee) => (
              <option key={employee.employee_id} value={employee.employee_id}>
                {employee.name} ({employee.employee_id})
              </option>
            ))}
          </select>
        </label>
        <button
          className="button button-primary"
          disabled={busy || loadingEmployees || !selectedEmployeeId}
          onClick={() => void recordAttendance("check-in")}
          type="button"
        >
          {busy ? "Saving..." : "Check in"}
        </button>
        <button
          className="button button-secondary"
          disabled={busy || loadingEmployees || !selectedEmployeeId}
          onClick={() => void recordAttendance("check-out")}
          type="button"
        >
          Check out
        </button>
      </div>

      <div className="section-heading">
        <h3>Attendance history</h3>
        {selectedEmployeeId && <span className="muted">Employee {selectedEmployeeId}</span>}
      </div>

      {loadingEmployees || loadingRecords ? (
        <Loading message="Loading attendance..." />
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Session</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.employee_id}-${record.date}-${record.entry_time}`}>
                  <td>{record.date}</td>
                  <td>{formatTime(record.entry_time)}</td>
                  <td>{formatTime(record.exit_time)}</td>
                  <td>{formatDuration(record.duration_minutes)}</td>
                  <td>
                    <span className={`status-pill ${record.exit_time ? "status-good" : "status-pending"}`}>
                      {record.exit_time ? "Complete" : "In progress"}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td className="empty-cell" colSpan={5}>No attendance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
