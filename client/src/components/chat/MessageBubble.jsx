import React from "react";
import Avatar from "../ui/Avatar";
import MessageAttachment from "./MessageAttachment";
import MessageReadStatus from "./MessageReadStatus";

/**
 * A single chat message.
 *
 * - `variant="room"` (default): group-chat style with an avatar and author name
 *   above each bubble (you need to know who said what).
 * - `variant="dm"`: WhatsApp-style 1:1 style — no avatar, no author name, and
 *   the time + read tick tucked inside the bubble at the bottom-right.
 */
export default function MessageBubble({
  message,
  authorLabel,
  avatarName,
  variant = "room",
  showReadStatus = false,
}) {
  const { mine, body, attachment, ts, read } = message;

  if (variant === "dm") {
    return <DmBubble {...{ mine, body, attachment, ts, read, showReadStatus }} />;
  }

  return (
    <div className={["group flex items-end gap-2.5", mine ? "justify-end" : "justify-start"].join(" ")}>
      {!mine ? <Avatar name={avatarName} size="sm" /> : null}

      <div className={["flex min-w-0 flex-col", mine ? "items-end text-right" : "items-start"].join(" ")}>
        <div className={["mb-1 flex items-center gap-2 text-[11px]", mine ? "justify-end" : ""].join(" ")}>
          <span className="font-semibold text-slate-200">{authorLabel}</span>
          <span className="text-slate-500">•</span>
          <Time ts={ts} className="text-slate-500" />
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

/**
 * WhatsApp-style DM bubble. The meta (time + tick) floats to the bottom-right so
 * short messages keep it on the same line and long ones let it wrap underneath.
 */
function DmBubble({ mine, body, attachment, ts, read, showReadStatus }) {
  return (
    <div className={["flex", mine ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[min(80%,30rem)] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ring-1",
          mine
            ? "rounded-br-md bg-indigo-600/30 text-slate-50 ring-indigo-500/30"
            : "rounded-bl-md bg-slate-800/70 text-slate-100 ring-slate-700/60",
        ].join(" ")}
      >
        {attachment ? <MessageAttachment attachment={attachment} /> : null}
        {body ? <span className="whitespace-pre-wrap break-words">{body}</span> : null}
        <span
          className={[
            "float-right ml-2 mt-1 inline-flex translate-y-0.5 select-none items-center gap-1 text-[10px] leading-none",
            mine ? "text-slate-300/70" : "text-slate-400/80",
          ].join(" ")}
        >
          <Time ts={ts} />
          {showReadStatus && mine ? <MessageReadStatus read={Boolean(read)} /> : null}
        </span>
      </div>
    </div>
  );
}

function Time({ ts, className = "" }) {
  try {
    const label = new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return <span className={className}>{label}</span>;
  } catch {
    return null;
  }
}
