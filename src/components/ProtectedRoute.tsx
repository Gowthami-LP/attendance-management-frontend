import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function ProtectedRoute() {
  const { admin, tenants, activeTenantId } = useAuth();
  const location = useLocation();

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  const isTenantSelection = location.pathname === "/select-tenant";
  if (!activeTenantId && !isTenantSelection) {
    return <Navigate to="/select-tenant" replace />;
  }

  if (
    activeTenantId &&
    isTenantSelection &&
    tenants.filter((tenant) => tenant.status === "active").length < 2
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
