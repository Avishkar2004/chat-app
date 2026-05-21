import React from "react";

/**
 * Read receipt arrows on your own messages (DMs).
 * One arrow = sent, not seen yet. Two arrows = seen by the other person.
 */
export default function MessageReadStatus({ read }) {
  const label = read ? "Seen" : "Sent";
  const color = read ? "text-sky-400" : "text-slate-500";

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${color}`}
      title={label}
      aria-label={label}
    >
      <Arrow />
      {read ? <Arrow className="-ml-2.5" /> : null}
    </span>
  );
}

function Arrow({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 ${className}`}
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}
