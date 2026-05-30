import React from "react";

/**
 * Read receipt ticks on your own messages (DMs).
 * Single grey tick = sent, not seen yet.
 * Double blue tick = seen by the other person.
 */
export default function MessageReadStatus({ read }) {
  const label = read ? "Read" : "Sent";
  // WhatsApp greys delivered ticks and turns them light blue (#53bdeb) on read.
  const color = read ? "text-[#53bdeb]" : "text-slate-400";

  return (
    <span
      className={`inline-flex items-center ${color}`}
      title={label}
      aria-label={label}
      role="img"
    >
      {read ? <DoubleTick /> : <SingleTick />}
    </span>
  );
}

/** WhatsApp-style single tick: one wide, shallow checkmark (message sent). */
function SingleTick() {
  return (
    <svg
      viewBox="0 0 18 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-[18px]"
      aria-hidden="true"
    >
      <path d="M4 6.2 7.2 9.2 13.2 1.8" />
    </svg>
  );
}

/**
 * WhatsApp-style double tick: two wide, shallow checkmarks that overlap so the
 * second tick's tail tucks behind the first (message read).
 */
function DoubleTick() {
  return (
    <svg
      viewBox="0 0 18 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-[18px]"
      aria-hidden="true"
    >
      <path d="M1 6.2 4.2 9.2 10.2 1.8" />
      <path d="M7.8 9.2 13.8 1.8" />
    </svg>
  );
}
