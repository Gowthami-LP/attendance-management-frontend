import { ArrowRight, Bell, CalendarCheck, ChartColumn, Users } from "lucide-react";
import { Link } from "react-router-dom";

const shortcuts = [
  {
    label: "Employees",
    description: "Manage employee records and active status.",
    path: "/employees",
    icon: Users,
  },
  {
    label: "Attendance",
    description: "Record check-ins and review an employee's history.",
    path: "/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Reports",
    description: "Review attendance summaries and weekly compliance.",
    path: "/reports",
    icon: ChartColumn,
  },
  {
    label: "Notifications",
    description: "Review delivery history and retry failed notices.",
    path: "/notifications",
    icon: Bell,
  },
];

export default function DashboardPage() {
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
          <p className="muted">Choose an area to manage attendance operations.</p>
        </div>
      </div>

      <div className="shortcut-grid">
        {shortcuts.map(({ label, description, path, icon: Icon }) => (
          <Link className="shortcut-card" key={path} to={path}>
            <span className="shortcut-icon"><Icon aria-hidden="true" size={20} /></span>
            <h3>{label}</h3>
            <p>{description}</p>
            <span className="shortcut-action">Open <ArrowRight aria-hidden="true" size={16} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
