import { useEffect, useState, type FormEvent } from "react";
import { getAttendanceReport, getWeeklyCompliance } from "../api/reports";
import { getErrorMessage } from "../api/errors";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import type { AttendanceReport, ReportPeriod, WeeklyCompliance } from "../types/reports";

const periods: ReportPeriod[] = ["daily", "weekly", "monthly", "yearly", "custom"];

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [referenceDate, setReferenceDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [compliance, setCompliance] = useState<WeeklyCompliance | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [complianceLoading, setComplianceLoading] = useState(true);
  const [reportError, setReportError] = useState("");
  const [complianceError, setComplianceError] = useState("");

  async function loadReport(filters: {
    period: ReportPeriod;
    reference_date?: string;
    start_date?: string;
    end_date?: string;
  }) {
    setReportLoading(true);
    setReportError("");
    try {
      setReport(await getAttendanceReport(filters));
    } catch (requestError) {
      setReportError(getErrorMessage(requestError, "Unable to load the attendance report."));
    } finally {
      setReportLoading(false);
    }
  }

  async function loadCompliance(selectedWeekStart?: string) {
    setComplianceLoading(true);
    setComplianceError("");
    try {
      setCompliance(await getWeeklyCompliance(selectedWeekStart));
    } catch (requestError) {
      setComplianceError(getErrorMessage(requestError, "Unable to load weekly compliance."));
    } finally {
      setComplianceLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    getAttendanceReport({ period: "weekly" })
      .then((result) => {
        if (active) {
          setReport(result);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setReportError(getErrorMessage(requestError, "Unable to load the attendance report."));
        }
      })
      .finally(() => {
        if (active) {
          setReportLoading(false);
        }
      });

    getWeeklyCompliance()
      .then((result) => {
        if (active) {
          setCompliance(result);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setComplianceError(getErrorMessage(requestError, "Unable to load weekly compliance."));
        }
      })
      .finally(() => {
        if (active) {
          setComplianceLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (period === "custom") {
      if (!startDate || !endDate) {
        setReportError("Choose both a start date and an end date.");
        return;
      }
      if (startDate > endDate) {
        setReportError("The start date must be on or before the end date.");
        return;
      }
      await loadReport({ period, start_date: startDate, end_date: endDate });
      return;
    }

    await loadReport({
      period,
      ...(referenceDate ? { reference_date: referenceDate } : {}),
    });
  }

  async function handleComplianceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadCompliance(weekStart || undefined);
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Reports &amp; compliance</h2>
          <p className="muted">Report summaries and compliance results returned by the service.</p>
        </div>
      </div>

      <div className="panel report-panel">
        <div className="section-heading">
          <div>
            <h3>Attendance report</h3>
            <p className="muted">Select a period supported by the backend.</p>
          </div>
        </div>
        <form className="toolbar report-toolbar" onSubmit={handleReportSubmit}>
          <label>
            Period
            <select value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)}>
              {periods.map((option) => (
                <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
          </label>
          {period === "custom" ? (
            <>
              <label>
                Start date
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
              </label>
              <label>
                End date
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
              </label>
            </>
          ) : (
            <label>
              Reference date (optional)
              <input type="date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} />
            </label>
          )}
          <button className="button button-primary" disabled={reportLoading} type="submit">
            {reportLoading ? "Loading..." : "Generate report"}
          </button>
        </form>

        {reportError && <ErrorMessage message={reportError} />}
        {reportLoading ? (
          <Loading message="Loading report..." />
        ) : report ? (
          <>
            <p className="muted report-dates">
              {report.period}: {report.start_date} to {report.end_date}
            </p>
            <div className="metric-grid">
              {[
                ["Records", report.summary.total_records],
                ["Present", report.summary.present],
                ["Incomplete", report.summary.incomplete],
                ["Not attended", report.summary.not_attended],
                ["Not recorded yet", report.summary.not_recorded_yet],
              ].map(([label, value]) => (
                <div className="metric-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.records.map((record) => (
                    <tr key={`${record.employee_id}-${record.date}`}>
                      <td>{record.date}</td>
                      <td>{record.employee_name} <span className="muted">({record.employee_id})</span></td>
                      <td>{record.department}</td>
                      <td>{record.entry_time ?? "—"}</td>
                      <td>{record.exit_time ?? "—"}</td>
                      <td>{record.working_hours ?? "—"}</td>
                      <td>{record.attendance_status}</td>
                    </tr>
                  ))}
                  {report.records.length === 0 && (
                    <tr><td className="empty-cell" colSpan={7}>No report records for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>

      <div className="panel report-panel">
        <div className="section-heading">
          <div>
            <h3>Weekly compliance</h3>
            <p className="muted">The status and review reason are authoritative backend results.</p>
          </div>
          <span className="status-pill status-muted">
            Policy: minimum 3 qualifying days and 15 hours
          </span>
        </div>
        <form className="toolbar report-toolbar" onSubmit={handleComplianceSubmit}>
          <label>
            Week start (Monday, optional)
            <input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)} />
          </label>
          <button className="button button-secondary" disabled={complianceLoading} type="submit">
            {complianceLoading ? "Loading..." : "Load compliance"}
          </button>
        </form>

        {complianceError && <ErrorMessage message={complianceError} />}
        {complianceLoading ? (
          <Loading message="Loading compliance..." />
        ) : compliance ? (
          <>
            <p className="muted report-dates">
              Week: {compliance.week_start} to {compliance.week_end} · Evaluation {compliance.evaluation_status}
            </p>
            <div className="metric-grid">
              {[
                ["Employees", compliance.total_employees],
                ["Compliant", compliance.compliant_employees],
                ["Violations", compliance.violating_employees],
                ["In progress", compliance.employees_in_progress],
                ["Needs review", compliance.employees_needing_review],
              ].map(([label, value]) => (
                <div className="metric-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Qualifying days</th>
                    <th>Total hours</th>
                    <th>Hours shortfall</th>
                    <th>Incomplete sessions</th>
                    <th>Status / reason</th>
                  </tr>
                </thead>
                <tbody>
                  {compliance.employees.map((employee) => (
                    <tr key={employee.employee_id}>
                      <td>{employee.employee_name} <span className="muted">({employee.employee_id})</span></td>
                      <td>{employee.department}</td>
                      <td>{employee.qualifying_days}</td>
                      <td>{employee.total_hours}</td>
                      <td>{employee.hours_shortfall}</td>
                      <td>{employee.incomplete_sessions}</td>
                      <td>
                        <span className={`status-pill status-${employee.compliance_status}`}>
                          {employee.compliance_status.replaceAll("_", " ")}
                        </span>
                        <p className="reason-text">{employee.reason}</p>
                      </td>
                    </tr>
                  ))}
                  {compliance.employees.length === 0 && (
                    <tr><td className="empty-cell" colSpan={7}>No compliance records for this week.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
