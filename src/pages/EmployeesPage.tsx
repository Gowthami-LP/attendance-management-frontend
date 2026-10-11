import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createEmployee, deactivateEmployee, getEmployees, updateEmployee } from "../api/employees";
import { getErrorMessage } from "../api/errors";
import type { Employee, EmployeeCreate, EmployeeUpdate } from "../types/employee";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

const emptyForm: EmployeeCreate = {
  employee_id: "",
  name: "",
  email: "",
  department: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState<EmployeeCreate>(emptyForm);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function loadEmployees() {
    setError("");
    setLoading(true);

    try {
      setEmployees(await getEmployees());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load employees."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchEmployees() {
      try {
        const result = await getEmployees();
        if (active) {
          setEmployees(result);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError, "Unable to load employees."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchEmployees();
    return () => {
      active = false;
    };
  }, []);

  const visibleEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? employee.is_active : !employee.is_active);
      const searchable = [
        employee.employee_id,
        employee.name,
        employee.email,
        employee.department,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchable.includes(normalizedQuery);
    });
  }, [employees, query, statusFilter]);

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setFeedback("");
    setFormOpen(true);
  }

  function openEditForm(employee: Employee) {
    setEditing(employee);
    setForm({
      employee_id: employee.employee_id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });
    setError("");
    setFeedback("");
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editing) {
        const updates: EmployeeUpdate = {
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
        };
        await updateEmployee(editing.employee_id, updates);
        setFeedback("Employee updated.");
      } else {
        await createEmployee({
          employee_id: form.employee_id.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
        });
        setFeedback("Employee created.");
      }

      setFormOpen(false);
      await loadEmployees();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to save the employee."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(employee: Employee) {
    if (!window.confirm(`Deactivate ${employee.name}? Their history will be preserved.`)) {
      return;
    }

    setError("");
    setFeedback("");
    try {
      await deactivateEmployee(employee.employee_id);
      setFeedback(`${employee.name} was deactivated.`);
      await loadEmployees();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to deactivate the employee."));
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Directory</p>
          <h2>Employees</h2>
          <p className="muted">Employee records from the attendance service.</p>
        </div>
        <button className="button button-primary" onClick={openCreateForm} type="button">
          Add employee
        </button>
      </div>

      {feedback && <p className="success-message" role="status">{feedback}</p>}
      {error && <ErrorMessage message={error} />}

      {formOpen && (
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="page-heading compact-heading">
            <h3>{editing ? "Edit employee" : "Add employee"}</h3>
            <button
              className="button button-quiet"
              onClick={() => setFormOpen(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
          <div className="form-grid">
            {!editing && (
              <label>
                Employee ID
                <input
                  value={form.employee_id}
                  onChange={(event) => setForm({ ...form, employee_id: event.target.value })}
                  minLength={3}
                  maxLength={20}
                  required
                />
              </label>
            )}
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                minLength={2}
                maxLength={100}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label>
              Department
              <input
                value={form.department}
                onChange={(event) => setForm({ ...form, department: event.target.value })}
                minLength={2}
                maxLength={50}
                required
              />
            </label>
          </div>
          <button className="button button-primary" disabled={saving} type="submit">
            {saving ? "Saving..." : editing ? "Save changes" : "Create employee"}
          </button>
        </form>
      )}

      <div className="toolbar panel">
        <label className="search-field">
          Search employees
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, ID, email, department"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button className="button button-secondary" onClick={() => void loadEmployees()} type="button">
          Refresh
        </button>
      </div>

      {loading ? (
        <Loading message="Loading employees..." />
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.map((employee) => (
                <tr key={employee.employee_id}>
                  <td>{employee.employee_id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department}</td>
                  <td>
                    <span className={`status-pill ${employee.is_active ? "status-good" : "status-muted"}`}>
                      {employee.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="button button-quiet" onClick={() => openEditForm(employee)} type="button">
                      Edit
                    </button>
                    {employee.is_active && (
                      <button
                        className="button button-danger-quiet"
                        onClick={() => void handleDeactivate(employee)}
                        type="button"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {visibleEmployees.length === 0 && (
                <tr>
                  <td className="empty-cell" colSpan={6}>
                    {employees.length ? "No employees match these filters." : "No employees found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
