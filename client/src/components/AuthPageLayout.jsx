import React, { useId, useState } from "react";
import { Link } from "react-router-dom";

const inputClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20";

const inputWithIconClass = inputClass.replace("px-4", "pl-11 pr-4");

const labelClass = "block text-sm font-medium text-slate-300";

/** Shared polished shell for Login / Signup — matches ChatApp glass + indigo accents. */
export default function AuthPageLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center px-4 py-4">
      <div className="relative w-full max-w-[440px] px-1">
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/15 to-transparent opacity-60 blur-xl"
        />
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl ring-1 ring-white/5 sm:p-9">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-200 ring-1 ring-indigo-500/25 transition hover:bg-indigo-500/25"
            >
              ChatApp
            </Link>
            <h1 className="mt-5 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {subtitle}
            </p>
          </div>

          <div className="relative mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

const primaryButtonClass =
  "w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60";

const errorBoxClass =
  "rounded-xl border border-rose-500/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-100 backdrop-blur-sm";

const footerLinkClass =
  "font-medium text-indigo-300 underline-offset-2 transition hover:text-indigo-200 hover:underline";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const iconWrapClass =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-300 transition-colors";

export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.05rem] w-[1.05rem]" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.05rem] w-[1.05rem]" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.05rem] w-[1.05rem]" {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.1rem] w-[1.1rem]" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.1rem] w-[1.1rem]" {...props}>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 6.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3.3 4.1M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.3-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Fields                                                              */
/* ------------------------------------------------------------------ */

/** Labeled text input with an optional leading icon. */
export function AuthField({ label, hint, icon: Icon, ...props }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {hint ? <span className="font-normal text-slate-500"> {hint}</span> : null}
      </label>
      <div className="relative mt-1.5">
        <input id={id} className={Icon ? inputWithIconClass : inputClass} {...props} />
        {Icon ? (
          <span className={iconWrapClass} aria-hidden="true">
            <Icon />
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Password input with leading lock icon, show/hide toggle and Caps Lock warning. */
export function PasswordField({ label, hint, ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  function handleKey(e) {
    if (typeof e.getModifierState === "function") {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  }

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {hint ? <span className="font-normal text-slate-500"> {hint}</span> : null}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={show ? "text" : "password"}
          className={inputWithIconClass.replace("pr-4", "pr-11")}
          onKeyUp={handleKey}
          onKeyDown={handleKey}
          onBlur={() => setCapsOn(false)}
          {...props}
        />
        <span className={iconWrapClass} aria-hidden="true">
          <LockIcon />
        </span>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {capsOn ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-300/90">
          <span aria-hidden="true">⚠</span> Caps Lock is on
        </p>
      ) : null}
    </div>
  );
}

const STRENGTH = [
  { label: "Too short", color: "bg-rose-500" },
  { label: "Weak", color: "bg-rose-500" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-emerald-500" },
];

function scorePassword(pw) {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

/** Small 4-segment strength meter; renders nothing until the user types. */
export function PasswordStrength({ value }) {
  if (!value) return null;
  const score = scorePassword(value);
  const { label, color } = STRENGTH[score];
  return (
    <div className="mt-2">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? color : "bg-slate-700/70"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Password strength: <span className="text-slate-300">{label}</span>
      </p>
    </div>
  );
}

/** Primary submit button with a built-in loading spinner. */
export function SubmitButton({ loading, loadingText, children, ...props }) {
  return (
    <button type="submit" disabled={loading} className={primaryButtonClass} {...props}>
      <span className="flex items-center justify-center gap-2">
        {loading ? <SpinnerIcon /> : null}
        {loading ? loadingText || children : children}
      </span>
    </button>
  );
}

export {
  inputClass,
  labelClass,
  primaryButtonClass,
  errorBoxClass,
  footerLinkClass,
};
