import React from "react";
import Avatar from "../ui/Avatar";
import ConnectionStatus from "./ConnectionStatus";

export default function ChatPanelHeader({
  title,
  subtitle,
  connected,
  typingUser,
  avatarName,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/30 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {avatarName ? <Avatar name={avatarName} size="md" /> : null}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight text-slate-100">
            {title}
          </div>
          <div className="truncate text-xs text-slate-400">{subtitle}</div>
        </div>
      </div>
      <ConnectionStatus connected={connected} typingUser={typingUser} />
    </div>
  );
}
