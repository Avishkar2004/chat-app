import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute -bottom-28 right-[-60px] h-[520px] w-[520px] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_-200px,rgba(99,102,241,0.25),transparent_60%)]" />
      </div>

      <header className="border-b border-slate-800/80 bg-slate-950/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            <span className="rounded-md bg-indigo-500/15 px-2 py-1 text-indigo-200">
              ChatApp
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-slate-300">@{user.username}</span>
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

