import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { THEMES, useTheme } from "./theme/ThemeContext";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute -bottom-28 right-[-60px] h-[520px] w-[520px] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(1200px circle at 50% -200px, rgb(var(--c-glow) / 0.25), transparent 60%)",
          }}
        />
      </div>

      <header className="border-b border-slate-800/80 bg-slate-950/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            <span className="rounded-md bg-indigo-500/15 px-2 py-1 text-indigo-200">
              ChatApp
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-3">
            <ThemePicker theme={theme} setTheme={setTheme} />
            {user ? (
              <>
                <span className="hidden text-slate-300 sm:inline">
                  @{user.username}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-1.5 hover:bg-slate-950/70"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-1.5 hover:bg-slate-950/70"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

function ThemePicker({ theme, setTheme }) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Theme</span>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="appearance-none rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 hover:bg-slate-950/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        aria-label="Theme"
        title="Theme"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
            {t.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute right-2 h-4 w-4 text-slate-400"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  );
}
