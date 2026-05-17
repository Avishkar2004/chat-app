import React from "react";
import ConnectionStatus from "./ConnectionStatus";

export default function ChatPanelHeader({ title, subtitle, connected, typingUser }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/30 px-4 py-3">
      <div>
        <div className="text-sm font-semibold tracking-tight text-slate-100">{title}</div>
        <div className="text-xs text-slate-400">{subtitle}</div>
      </div>
      <ConnectionStatus connected={connected} typingUser={typingUser} />
    </div>
  );
}
