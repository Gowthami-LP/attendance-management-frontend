import { LogOut, UsersRound, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Header() {
  const { admin, tenants, activeTenantId, logout } = useAuth();
  const navigate = useNavigate();
  const activeTenant = tenants.find((tenant) => tenant.id === activeTenantId);

  return (
    <header className="app-header">
      <div>
        <h1>Attendance Management</h1>
        <p>Employee attendance and compliance</p>
      </div>

      <div className="header-user">
        <UserRound aria-hidden="true" size={20} />
        <span>{admin?.email}</span>
        {activeTenant && (
          <span className="header-tenant">
            <UsersRound aria-hidden="true" size={16} />
            {activeTenant.name}
          </span>
        )}
        {tenants.filter((tenant) => tenant.status === "active").length > 1 && (
          <button
            className="button button-quiet"
            onClick={() => navigate("/select-tenant")}
            type="button"
          >
            Change organization
          </button>
        )}
        <button className="button button-quiet" onClick={logout} type="button">
          <LogOut aria-hidden="true" size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
