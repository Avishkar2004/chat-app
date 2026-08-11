import React from "react";
import { WifiIcon, WifiOffIcon } from "../ui/icons";

/**
 * Whether the app is talking to the server.
 *
 * State is carried by an icon AND a word, never by colour alone: connected is a
 * wifi glyph reading "Connected", offline is a struck-through wifi glyph
 * reading "Reconnecting…".
 */
export default function ConnectionStatus({ connected, compact = false }) {
  const Icon = connected ? WifiIcon : WifiOffIcon;
  const text = connected ? "Connected" : "Reconnecting…";

  return (
    <span
      role="status"
      aria-live="polite"
      title={text}
      className={[
        "inline-flex flex-none items-center gap-1.5 text-meta",
        connected ? "text-fg-subtle" : "text-warning-text",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 flex-none" />
      <span className={compact ? "sr-only" : "hidden sm:inline"}>{text}</span>
      {compact ? null : <span className="sr-only sm:hidden">{text}</span>}
    </span>
  );
}

/**
 * "@someone is typing…" — shown at the foot of the message list rather than in
 * the header, so it appears right where the next message will land.
 */
export function TypingIndicator({ who }) {
  if (!who) return null;
  return (
    <div
      className="flex items-center gap-2 px-4 pb-1 pt-2 text-meta text-fg-muted"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-subtle"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span>{who} is typing…</span>
    </div>
  );
}
