import apiClient from "./client";
import type {
  AttendanceReport,
  ReportPeriod,
  WeeklyCompliance,
} from "../types/reports";

export async function getAttendanceReport(filters: {
  period: ReportPeriod;
  reference_date?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AttendanceReport> {
  const response = await apiClient.get<AttendanceReport>(
    "/api/v1/reports/attendance",
    { params: filters },
  );

  return response.data;
}

export async function getWeeklyCompliance(
  weekStart?: string,
): Promise<WeeklyCompliance> {
  const response = await apiClient.get<WeeklyCompliance>(
    "/api/v1/compliance/weekly",
    { params: weekStart ? { week_start: weekStart } : undefined },
  );

  return response.data;
}
