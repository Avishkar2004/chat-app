import React from "react";
import { displayHandle } from "../../lib/usernames";
import MessageBubble from "./MessageBubble";
import EmptyState from "./EmptyState";
import { TypingIndicator } from "./ConnectionStatus";

/** "Today" / "Yesterday" / "12 August 2026" for the day divider. */
function dayLabel(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function sameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * The scrolling conversation. It fills whatever height it is given — the
 * composer below it never moves, so on a phone it stays above the keyboard.
 *
 * @param {object} props
 * @param {React.Ref} props.listRef
 * @param {Array} props.messages
 * @param {string} props.myUsername
 * @param {string} [props.peerUsername] - the other person, for 1:1 chats
 * @param {object} [props.empty] - { title, description, action, icon }
 * @param {string} [props.typingUser] - who is typing right now
 */
export default function MessageList({
  listRef,
  messages,
  myUsername,
  peerUsername,
  empty,
  variant = "group",
  showReadStatus = false,
  typingUser,
}) {
  const meLabel = displayHandle(myUsername) || "You";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="scrollbar-slim min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-canvas px-3 py-4 sm:px-4"
      >
        {messages.length === 0 ? (
          <EmptyState tall {...empty} />
        ) : (
          <ol className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const newDay = !prev || !sameDay(prev.ts, m.ts);
              return (
                <li key={m.id} className={newDay && i > 0 ? "mt-3" : undefined}>
                  {newDay ? (
                    <div className="mb-3 flex justify-center">
                      <span className="rounded-full border border-line bg-surface px-3 py-1 text-meta font-medium text-fg-muted">
                        {dayLabel(m.ts)}
                      </span>
                    </div>
                  ) : null}
                  <MessageBubble
                    message={m}
                    authorLabel={
                      m.mine ? meLabel : displayHandle(m.author || peerUsername)
                    }
                    avatarName={m.mine ? myUsername : m.author || peerUsername}
                    variant={variant}
                    showReadStatus={showReadStatus}
                  />
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <TypingIndicator who={typingUser ? displayHandle(typingUser) : ""} />
    </div>
  );
}
