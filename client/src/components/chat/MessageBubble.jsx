import React from "react";
import Avatar from "../ui/Avatar";
import MessageAttachment from "./MessageAttachment";
import MessageReadStatus from "./MessageReadStatus";

export default function MessageBubble({
  message,
  authorLabel,
  avatarName,
  showReadStatus = false,
}) {
  const { mine, body, attachment, ts, read } = message;

  return (
    <div className={["group flex items-end gap-2.5", mine ? "justify-end" : "justify-start"].join(" ")}>
      {!mine ? <Avatar name={avatarName} size="sm" /> : null}

      <div className={["flex min-w-0 flex-col", mine ? "items-end text-right" : "items-start"].join(" ")}>
        <div className={["mb-1 flex items-center gap-2 text-[11px]", mine ? "justify-end" : ""].join(" ")}>
          <span className="font-semibold text-slate-200">{authorLabel}</span>
          <span className="text-slate-500">•</span>
          <Time ts={ts} />
          {showReadStatus && mine ? (
            <>
              <span className="text-slate-500">•</span>
              <MessageReadStatus read={Boolean(read)} />
            </>
          ) : null}
        </div>
        <div
          className={[
            "inline-flex max-w-[min(85%,36rem)] break-words whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed shadow-sm ring-1 transition",
            mine
              ? "rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-600/30 via-indigo-500/15 to-fuchsia-500/10 text-slate-50 ring-indigo-500/30 shadow-indigo-600/10"
              : "rounded-2xl rounded-bl-md bg-slate-950/45 text-slate-100 ring-slate-800/80",
          ].join(" ")}
        >
          <MessageAttachment attachment={attachment} />
          {body}
        </div>
      </div>

      {mine ? <Avatar name={avatarName} size="sm" /> : null}
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
