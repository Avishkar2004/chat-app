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

export default function SignupPage() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup({ email, username, password });
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      title="Create your account"
      subtitle="You’ll be signed in automatically and can jump straight into the chat."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <label className={labelClass}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className={labelClass}>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            autoComplete="username"
            placeholder="cool_dev"
          />
        </label>

        <label className={labelClass}>
          Password
          <span className="font-normal text-slate-500"> (min 8 characters)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </label>

        {error ? <div className={errorBoxClass}>{error}</div> : null}

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Creating…" : "Create account"}
        </button>

        <p className="border-t border-slate-800/80 pt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className={footerLinkClass} to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthPageLayout>
  );
}
