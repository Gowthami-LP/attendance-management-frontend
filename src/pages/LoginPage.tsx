import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/errors";
import { useAuth } from "../auth/useAuth";
import ErrorMessage from "../components/ErrorMessage";

export default function LoginPage() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (admin) {
      navigate("/dashboard", { replace: true });
    }
  }, [admin, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(getErrorMessage(requestError, "Unable to sign in. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Administrator portal</p>
        <h1>Sign in</h1>
        <p className="muted">Use your administrator account to continue.</p>

        {error && <ErrorMessage message={error} />}

        <label>
          Email
          <input
            autoComplete="username"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="button button-primary button-full" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
