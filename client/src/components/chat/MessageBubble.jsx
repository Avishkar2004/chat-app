import React from "react";
import Avatar from "../ui/Avatar";
import MessageAttachment from "./MessageAttachment";
import MessageReadStatus from "./MessageReadStatus";
import { formatTime } from "../../lib/format";

/** Machine-readable timestamp, or nothing if the value is unusable. */
function isoTime(ts) {
  try {
    const iso = new Date(ts).toISOString();
    return iso;
  } catch {
    return undefined;
  }
}

/**
 * One message.
 *
 * - `variant="group"`: group chat — avatar and the sender's name sit above the
 *   bubble, because you need to know who said what.
 * - `variant="dm"`: one-to-one — no avatar, no name, and the time plus the read
 *   tick tuck into the bottom-right of the bubble itself.
 *
 * Message text is 15px. Everything else (name, time, tick) is 12px and quieter,
 * so the words always win. Bubbles never exceed 65 characters of line length.
 */
export default function MessageBubble({
  message,
  authorLabel,
  avatarName,
  variant = "group",
  showReadStatus = false,
}) {
  const { mine, body, attachment, ts, read } = message;

  const bubbleTone = mine
    ? "bg-bubble-out text-bubble-out-fg"
    : "bg-bubble-in text-bubble-in-fg border border-line";

  if (variant === "dm") {
    return (
      <div className={["flex", mine ? "justify-end" : "justify-start"].join(" ")}>
        <div
          className={[
            "max-w-[min(88%,65ch)] rounded-2xl px-3.5 py-2.5 text-msg",
            mine ? "rounded-br-sm" : "rounded-bl-sm",
            bubbleTone,
          ].join(" ")}
        >
          <MessageAttachment attachment={attachment} onDark={mine} />
          {body ? (
            <span className="whitespace-pre-wrap break-words">{body}</span>
          ) : null}
          <span
            className={[
              "float-right ml-2 mt-1 inline-flex translate-y-1 select-none items-center gap-1 text-meta leading-none",
              mine ? "text-bubble-out-fg/80" : "text-fg-subtle",
            ].join(" ")}
          >
            <time dateTime={isoTime(ts)}>{formatTime(ts)}</time>
            {showReadStatus && mine ? (
              <MessageReadStatus read={Boolean(read)} />
            ) : null}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "flex items-end gap-2",
        mine ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
    >
      <Avatar name={avatarName} size="sm" />

      <div
        className={[
          "flex min-w-0 max-w-[min(88%,65ch)] flex-col",
          mine ? "items-end" : "items-start",
        ].join(" ")}
      >
        <div className="mb-1 flex max-w-full items-center gap-2 px-1 text-meta">
          <span className="truncate font-semibold text-fg-muted">
            {authorLabel}
          </span>
          <time className="flex-none text-fg-subtle" dateTime={isoTime(ts)}>
            {formatTime(ts)}
          </time>
        </div>
        <div
          className={[
            "max-w-full whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-msg",
            mine ? "rounded-br-sm" : "rounded-bl-sm",
            bubbleTone,
          ].join(" ")}
        >
          <MessageAttachment attachment={attachment} onDark={mine} />
          {body}
        </div>
      </div>
    </div>
  );
}
