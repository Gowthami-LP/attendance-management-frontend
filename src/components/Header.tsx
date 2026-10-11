import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "../auth/useAuth";

export default function Header() {
  const { admin, logout } = useAuth();

  return (
    <header className="app-header">
      <div>
        <h1>Attendance Management</h1>
        <p>Employee attendance and compliance</p>
      </div>

      <div className="header-user">
        <UserRound aria-hidden="true" size={20} />
        <span>{admin?.email}</span>
        <button className="button button-quiet" onClick={logout} type="button">
          <LogOut aria-hidden="true" size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
