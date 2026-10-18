import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import ErrorMessage from "../components/ErrorMessage";

export default function TenantSelectionPage() {
  const { tenants, activeTenantId, selectTenant, logout } = useAuth();
  const navigate = useNavigate();
  const activeTenants = tenants.filter((tenant) => tenant.status === "active");

  function handleSelect(tenantId: string) {
    selectTenant(tenantId);
    navigate("/dashboard", { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="tenant-selection-title">
        <p className="eyebrow">Workspace</p>
        <h1 id="tenant-selection-title">Choose an organization</h1>
        <p className="muted">
          Select the organization whose attendance data you want to manage.
        </p>

        {activeTenants.length === 0 ? (
          <>
            <ErrorMessage message="Your account has no active organization access. Ask an administrator to grant access." />
            <button className="button button-secondary button-full" onClick={logout} type="button">
              Sign out
            </button>
          </>
        ) : (
          <div className="tenant-options">
            {activeTenants.map((tenant) => (
              <button
                aria-pressed={tenant.id === activeTenantId}
                className="button button-secondary button-full"
                key={tenant.id}
                onClick={() => handleSelect(tenant.id)}
                type="button"
              >
                {tenant.name}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
