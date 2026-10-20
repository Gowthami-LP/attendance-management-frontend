import apiClient from "./client";
import type { AttendanceRecord } from "../types/attendance";

export async function getAttendance(
  employeeId: string,
): Promise<AttendanceRecord[]> {
  const response = await apiClient.get<AttendanceRecord[]>(
    `/api/v1/attendance/${encodeURIComponent(employeeId)}`,
  );

  return response.data;
}

export async function checkIn(employeeId: string): Promise<AttendanceRecord> {
  const response = await apiClient.post<AttendanceRecord>(
    "/api/v1/attendance/check-in",
    { employee_id: employeeId },
    { headers: { "Idempotency-Key": crypto.randomUUID() } },
  );

  return response.data;
}

export async function checkOut(employeeId: string): Promise<AttendanceRecord> {
  const response = await apiClient.post<AttendanceRecord>(
    "/api/v1/attendance/check-out",
    { employee_id: employeeId },
    { headers: { "Idempotency-Key": crypto.randomUUID() } },
  );

  return response.data;
}
