import React, { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ChatIcon } from "./ui/icons";

/* Editable fields are 16px on purpose: anything smaller makes iOS zoom the
   whole page in when the field is focused. */
const inputClass =
  "h-12 w-full rounded-xl border border-line bg-surface-2 px-4 text-base text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent";

const inputWithIconClass = inputClass.replace("px-4", "pl-11 pr-4");

const labelClass = "block text-label font-medium text-fg";

/**
 * Shared frame for Log in / Sign up. One flat card, one hairline border, no
 * glow and no gradient text — the form is the only thing on the screen.
 */
export default function AuthPageLayout({ title, subtitle, children }) {
  return (
    <div className="scrollbar-slim h-full overflow-y-auto px-4 py-8">
      <div className="mx-auto w-full max-w-[26rem]">
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg text-fg"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-fg">
              <ChatIcon className="h-5 w-5" />
            </span>
            <span className="text-msg font-semibold">ChatApp</span>
          </Link>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-fg">
            {title}
          </h1>
          <p className="mt-2 text-label leading-relaxed text-fg-muted">
            {subtitle}
          </p>

          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* The single filled button on these screens. */
const primaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-msg font-semibold text-accent-fg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60";

const errorBoxClass =
  "rounded-xl border border-line bg-danger-soft px-4 py-3 text-label text-danger-text";

const footerLinkClass =
  "font-semibold text-accent-text underline underline-offset-2 hover:no-underline";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const iconWrapClass =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle";

export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" {...props}>
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

/** Labelled text input with an optional leading icon. */
export function AuthField({ label, hint, icon: Icon, ...props }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {hint ? <span className="font-normal text-fg-subtle"> {hint}</span> : null}
      </label>
      <div className="relative mt-1.5">
        <input id={id} className={Icon ? inputWithIconClass : inputClass} {...props} />
        {Icon ? (
          <span className={iconWrapClass}>
            <Icon />
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Password input with a show/hide toggle and a Caps Lock warning. */
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
        {hint ? <span className="font-normal text-fg-subtle"> {hint}</span> : null}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={show ? "text" : "password"}
          className={inputWithIconClass.replace("pr-4", "pr-12")}
          onKeyUp={handleKey}
          onKeyDown={handleKey}
          onBlur={() => setCapsOn(false)}
          {...props}
        />
        <span className={iconWrapClass}>
          <LockIcon />
        </span>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          title={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-3 hover:text-fg"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {capsOn ? (
        <p className="mt-1.5 text-meta text-warning-text">Caps Lock is on</p>
      ) : null}
    </div>
  );
}

/* Strength is spelled out in words as well as bars — the colour is a hint, not
   the message. */
const STRENGTH = [
  { label: "Too short", color: "bg-danger" },
  { label: "Weak", color: "bg-danger" },
  { label: "Fair", color: "bg-warning" },
  { label: "Good", color: "bg-positive" },
  { label: "Strong", color: "bg-positive" },
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

/** Four-segment strength meter; renders nothing until the user types. */
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
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= score ? color : "bg-surface-3"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-meta text-fg-subtle" aria-live="polite">
        Password strength: <span className="font-semibold text-fg-muted">{label}</span>
      </p>
    </div>
  );
}

/** The one filled button on the screen, with a built-in loading state. */
export function SubmitButton({ loading, loadingText, children, ...props }) {
  return (
    <button type="submit" disabled={loading} className={primaryButtonClass} {...props}>
      {loading ? <SpinnerIcon /> : null}
      {loading ? loadingText || children : children}
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
