import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPageLayout, {
  AuthField,
  PasswordField,
  PasswordStrength,
  SubmitButton,
  MailIcon,
  UserIcon,
  errorBoxClass,
  footerLinkClass,
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
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <AuthField
          label="Email"
          icon={MailIcon}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
        />

        <AuthField
          label="Username"
          icon={UserIcon}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="cool_dev"
        />

        <div>
          <PasswordField
            label="Password"
            hint="(min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />
          <PasswordStrength value={password} />
        </div>

        {error ? (
          <div className={errorBoxClass} role="alert">
            {error}
          </div>
        ) : null}

        <SubmitButton loading={submitting} loadingText="Creating…">
          Create account
        </SubmitButton>

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
