import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPageLayout, {
  AuthField,
  PasswordField,
  SubmitButton,
  UserIcon,
  errorBoxClass,
  footerLinkClass,
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
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <AuthField
          label="Email or username"
          icon={UserIcon}
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          placeholder="you@email.com or handle"
        />

        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {error ? (
          <div className={errorBoxClass} role="alert">
            {error}
          </div>
        ) : null}

        <SubmitButton loading={submitting} loadingText="Signing in…">
          Sign in
        </SubmitButton>

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
