import React from "react";
import { initials } from "../../lib/format";

/**
 * Deterministic avatar. Each person gets a stable colour derived from their
 * name so they are distinguishable at a glance. These identity colours are
 * intentionally outside the theme tokens (they must stay stable and distinct in
 * light and dark), but they are still Tailwind palette classes — no raw hex.
 * Every one of them carries white initials at 4.5:1 or better.
 */
const IDENTITY_COLORS = [
  "bg-rose-600",
  "bg-orange-700",
  "bg-amber-700",
  "bg-green-700",
  "bg-emerald-700",
  "bg-teal-700",
  "bg-sky-700",
  "bg-blue-700",
  "bg-indigo-700",
  "bg-violet-700",
  "bg-fuchsia-700",
  "bg-pink-700",
];

const SIZES = {
  xs: "h-7 w-7 text-meta",
  sm: "h-9 w-9 text-meta",
  md: "h-10 w-10 text-label",
  lg: "h-12 w-12 text-msg",
};

const DOT_SIZES = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

function hashIndex(name, len) {
  const s = String(name || "?");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % len;
}

/**
 * @param {object} props
 * @param {string} props.name
 * @param {"xs"|"sm"|"md"|"lg"} [props.size]
 * @param {boolean} [props.online] - when provided, draws a presence dot. The
 *   dot is decorative: callers MUST also show the state as text nearby, since
 *   colour alone may not carry meaning.
 */
export default function Avatar({ name, size = "sm", online }) {
  const color = IDENTITY_COLORS[hashIndex(name, IDENTITY_COLORS.length)];

  return (
    <span className="relative inline-flex flex-none">
      <span
        className={[
          "inline-flex items-center justify-center rounded-full font-semibold text-white",
          color,
          SIZES[size] || SIZES.sm,
        ].join(" ")}
      >
        {initials(name)}
      </span>
      {online != null ? (
        <span
          aria-hidden="true"
          className={[
            "absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-surface",
            DOT_SIZES[size] || DOT_SIZES.sm,
            online ? "bg-positive" : "bg-fg-subtle",
          ].join(" ")}
        />
      ) : null}
    </span>
  );
}
