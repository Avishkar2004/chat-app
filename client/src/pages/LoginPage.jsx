import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPageLayout, {
  errorBoxClass,
  footerLinkClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../components/AuthPageLayout";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ emailOrUsername, password });
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off in your conversations."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <label className={labelClass}>
          Email or username
          <input
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className={inputClass}
            autoComplete="username"
            placeholder="you@email.com or handle"
          />
        </label>

        <label className={labelClass}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>

        {error ? <div className={errorBoxClass}>{error}</div> : null}

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="border-t border-slate-800/80 pt-6 text-center text-sm text-slate-500">
          Don’t have an account?{" "}
          <Link className={footerLinkClass} to="/signup">
            Create one
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  );
}
