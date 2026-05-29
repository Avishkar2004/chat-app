import React from "react";
import Avatar from "../ui/Avatar";
import { displayHandle } from "../../lib/usernames";

export default function ChatSidebarHeader({ username, switchLabel, onSwitch, switchPrimary }) {
  const switchClass = switchPrimary
    ? "rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-400"
    : "rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-950/60";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={username} size="md" online />
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Signed in as</div>
          <div className="truncate text-sm font-semibold tracking-tight text-slate-100">
            {displayHandle(username)}
          </div>
        </div>
      </div>
      <button type="button" onClick={onSwitch} className={switchClass}>
        {switchLabel}
      </button>
    </div>
  );
}
