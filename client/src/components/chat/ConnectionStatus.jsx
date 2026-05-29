import React from "react";

export default function ConnectionStatus({ connected, typingUser }) {
  if (connected && typingUser) {
    return (
      <div className="hidden items-center gap-2 text-xs text-indigo-300 sm:flex">
        <TypingDots />
        <span>{typingUser} is typing…</span>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="relative flex h-2.5 w-2.5">
        {connected ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
        ) : null}
        <span
          className={[
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            connected ? "bg-emerald-400" : "bg-rose-500",
          ].join(" ")}
        />
      </span>
      <span className={["text-xs", connected ? "text-slate-400" : "text-rose-300"].join(" ")}>
        {connected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
