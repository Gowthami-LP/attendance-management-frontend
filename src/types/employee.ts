export interface Employee {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
}

export interface EmployeeCreate {
  employee_id: string;
  name: string;
  email: string;
  department: string;
}

export interface EmployeeUpdate {
  name?: string;
  email?: string;
  department?: string;
}
