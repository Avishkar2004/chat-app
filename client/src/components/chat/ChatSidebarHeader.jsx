import React from "react";
import { displayHandle } from "../../lib/usernames";

export default function ChatSidebarHeader({ username, switchLabel, onSwitch, switchPrimary }) {
  const switchClass = switchPrimary
    ? "rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
    : "rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-950/60";

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs text-slate-400">Signed in as</div>
        <div className="mt-0.5 text-base font-semibold tracking-tight text-slate-100">
          {displayHandle(username)}
        </div>
      </div>
      <button type="button" onClick={onSwitch} className={switchClass}>
        {switchLabel}
      </button>
    </div>
  );
}
