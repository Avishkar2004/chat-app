import React from "react";
import { displayHandle } from "../../lib/usernames";
import MessageBubble from "./MessageBubble";
import EmptyState from "./EmptyState";

/**
 * Scrollable message feed.
 * @param {object} props
 * @param {React.Ref} props.listRef
 * @param {Array} props.messages
 * @param {string} props.myUsername - logged-in user's username
 * @param {string} [props.peerUsername] - DM friend username (for avatar + labels)
 * @param {object} [props.empty] - { title, description, tall }
 * @param {boolean} [props.requirePeer] - show "select friend" empty state when no peer
 */
export default function MessageList({
  listRef,
  messages,
  myUsername,
  peerUsername,
  empty,
  requirePeer,
  variant = "room",
  showReadStatus = false,
}) {
  const meLabel = displayHandle(myUsername) || "@you";
  const gap = variant === "dm" ? "space-y-1.5" : "space-y-3";

  if (requirePeer && !peerUsername) {
    return (
      <div ref={listRef} className="h-[58vh] overflow-y-auto px-4 py-4 sm:h-[62vh]">
        <EmptyState
          tall
          title="No friend selected"
          description="Select a friend on the left to start a direct message."
        />
      </div>
    );
  }

  return (
    <div ref={listRef} className="h-[58vh] overflow-y-auto px-4 py-4 sm:h-[62vh]">
      {messages.length === 0 ? (
        <EmptyState {...empty} />
      ) : (
        <div className={gap}>
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              authorLabel={m.mine ? meLabel : displayHandle(m.author || peerUsername)}
              avatarName={m.mine ? myUsername : m.author || peerUsername}
              variant={variant}
              showReadStatus={showReadStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
