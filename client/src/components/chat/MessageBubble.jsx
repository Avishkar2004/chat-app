import React from "react";
import { initials } from "../../lib/format";
import MessageAttachment from "./MessageAttachment";

export default function MessageBubble({ message, authorLabel, avatarName }) {
  const { mine, body, attachment, ts } = message;

  return (
    <div className={["flex items-end gap-3", mine ? "justify-end" : "justify-start"].join(" ")}>
      {!mine ? (
        <div className="w-9 flex-none">
          <Avatar name={avatarName} />
        </div>
      ) : null}

      <div className={["flex min-w-0 flex-col", mine ? "items-end text-right" : "items-start"].join(" ")}>
        <div className={["mb-1 flex items-center gap-2 text-[11px]", mine ? "justify-end" : ""].join(" ")}>
          <span className="font-semibold text-slate-200">{authorLabel}</span>
          <span className="text-slate-500">•</span>
          <Time ts={ts} />
        </div>
        <div
          className={[
            "inline-flex max-w-[min(85%,36rem)] break-words whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1",
            mine
              ? "bg-gradient-to-br from-indigo-600/30 via-indigo-500/15 to-fuchsia-500/10 text-slate-50 ring-indigo-500/30 shadow-indigo-600/10"
              : "bg-slate-950/45 text-slate-100 ring-slate-800/80",
          ].join(" ")}
        >
          <MessageAttachment attachment={attachment} />
          {body}
        </div>
      </div>

      {mine ? (
        <div className="w-9 flex-none">
          <Avatar name={avatarName} />
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ name }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 text-xs font-semibold text-slate-100 shadow-sm">
      {initials(name)}
    </div>
  );
}

function Time({ ts }) {
  try {
    const label = new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return <span className="text-slate-500">{label}</span>;
  } catch {
    return null;
  }
}
