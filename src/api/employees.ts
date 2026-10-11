import apiClient from "./client";
import type { Employee, EmployeeCreate, EmployeeUpdate } from "../types/employee";

export async function getEmployees(filters?: {
  department?: string;
  status?: "active" | "inactive";
}): Promise<Employee[]> {
  const response = await apiClient.get<Employee[]>("/employees", {
    params: filters,
  });

  return response.data;
}

export async function createEmployee(
  employee: EmployeeCreate,
): Promise<Employee> {
  const response = await apiClient.post<Employee>("/employees", employee);
  return response.data;
}

export async function updateEmployee(
  employeeId: string,
  updates: EmployeeUpdate,
): Promise<Employee> {
  const response = await apiClient.patch<Employee>(
    `/employees/${encodeURIComponent(employeeId)}`,
    updates,
  );

  return response.data;
}

export async function deactivateEmployee(
  employeeId: string,
): Promise<Employee> {
  const response = await apiClient.patch<Employee>(
    `/employees/${encodeURIComponent(employeeId)}/deactivate`,
  );

  return response.data;
}
