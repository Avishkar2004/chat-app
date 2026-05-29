import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { THEMES, useTheme } from "./theme/ThemeContext";
import Avatar from "./components/ui/Avatar";
import { ChatIcon, ChevronDownIcon, LogoutIcon, PaletteIcon } from "./components/ui/icons";
import { displayHandle } from "./lib/usernames";

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

      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/15">
              <ChatIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-100">
              ChatApp
            </span>
          </Link>

          <div className="flex items-center gap-2 text-sm sm:gap-3">
            <ThemePicker theme={theme} setTheme={setTheme} />
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden items-center gap-2 rounded-full border border-slate-800/80 bg-slate-950/40 py-1 pl-1 pr-3 sm:flex">
                  <Avatar name={user.username} size="xs" />
                  <span className="text-sm font-medium text-slate-200">
                    {displayHandle(user.username)}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-1.5 text-slate-200 transition hover:border-rose-500/40 hover:bg-rose-950/30 hover:text-rose-200"
                >
                  <LogoutIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-1.5 transition hover:bg-slate-950/70"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-3.5 py-1.5 font-medium text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-400"
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
      <PaletteIcon className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400" />
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="appearance-none rounded-lg border border-slate-800/80 bg-slate-950/40 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-200 transition hover:bg-slate-950/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        aria-label="Theme"
        title="Theme"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
            {t.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 h-4 w-4 text-slate-400" />
    </label>
  );
}
