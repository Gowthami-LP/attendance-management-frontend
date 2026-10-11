export interface AttendanceRecord {
  employee_id: string;
  date: string;
  entry_time: string;
  exit_time: string | null;
  duration_minutes: number | null;
}
