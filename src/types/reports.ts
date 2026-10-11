export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface AttendanceReportSummary {
  total_records: number;
  present: number;
  incomplete: number;
  not_attended: number;
  not_recorded_yet: number;
}

export interface AttendanceReportRow {
  employee_id: string;
  employee_name: string;
  department: string;
  is_active: boolean;
  date: string;
  entry_time: string | null;
  exit_time: string | null;
  working_hours: number | null;
  attendance_status: string;
}

export interface AttendanceReport {
  period: string;
  start_date: string;
  end_date: string;
  summary: AttendanceReportSummary;
  records: AttendanceReportRow[];
}

export type ComplianceStatus =
  | "compliant"
  | "violation"
  | "in_progress"
  | "needs_review";

export interface EmployeeCompliance {
  employee_id: string;
  employee_name: string;
  department: string;
  qualifying_days: number;
  total_hours: number;
  hours_shortfall: number;
  incomplete_sessions: number;
  compliance_status: ComplianceStatus;
  reason: string;
}

export interface WeeklyCompliance {
  week_start: string;
  week_end: string;
  evaluation_status: "completed" | "in_progress";
  total_employees: number;
  compliant_employees: number;
  violating_employees: number;
  employees_in_progress: number;
  employees_needing_review: number;
  employees: EmployeeCompliance[];
}
