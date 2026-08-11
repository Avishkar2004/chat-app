import React from "react";

/**
 * Read receipt on your own direct messages.
 *
 * The two states differ by SHAPE, not colour: one tick = sent, two ticks =
 * seen. Colour and opacity only reinforce it, and each state carries a text
 * label for screen readers and on hover.
 */
export default function MessageReadStatus({ read }) {
  const label = read ? "Seen" : "Sent";

  return (
    <span
      className={[
        "inline-flex items-center",
        read ? "opacity-100" : "opacity-75",
      ].join(" ")}
      title={label}
    >
      {read ? <DoubleTick /> : <SingleTick />}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** One tick: the message left your device. */
function SingleTick() {
  return (
    <svg
      viewBox="0 0 18 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-[18px]"
      aria-hidden="true"
    >
      <path d="M4 6.2 7.2 9.2 13.2 1.8" />
    </svg>
  );
}

/** Two overlapping ticks: the other person has opened it. */
function DoubleTick() {
  return (
    <svg
      viewBox="0 0 18 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
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
