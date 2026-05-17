import React from "react";

export default function ConnectionStatus({ connected, typingUser }) {
  let label = "Connected";
  if (!connected) label = "Disconnected";
  else if (typingUser) label = `${typingUser} is typing…`;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
