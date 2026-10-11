import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ChartColumn,
  Bell,
} from "lucide-react";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", path: "/employees", icon: Users },
  { label: "Attendance", path: "/attendance", icon: CalendarCheck },
  { label: "Reports", path: "/reports", icon: ChartColumn },
  { label: "Notifications", path: "/notifications", icon: Bell },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Attendance System</h2>

      <nav>
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
