import React from "react";
import { Link } from "react-router-dom";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20";

const labelClass = "block text-sm font-medium text-slate-300";

/** Shared polished shell for Login / Signup — matches ChatApp glass + indigo accents. */
export default function AuthPageLayout({ title, subtitle, children }) {
  return (
    <div className="flex w-full justify-center px-4 py-10 sm:min-h-[calc(100dvh-6rem)] sm:items-center sm:py-12">
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
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>
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

const footerLinkClass = "font-medium text-indigo-300 underline-offset-2 transition hover:text-indigo-200 hover:underline";

export { inputClass, labelClass, primaryButtonClass, errorBoxClass, footerLinkClass };
