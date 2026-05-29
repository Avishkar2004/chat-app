import React from "react";
import { initials } from "../../lib/format";

/**
 * Deterministic, colorful avatar. Each user gets a stable gradient derived from
 * their name, so people are visually distinguishable at a glance. Colours are
 * fixed Tailwind hues (not theme tokens) so they stay vivid across every theme.
 */
const GRADIENTS = [
  "from-rose-500 to-pink-600",
  "from-orange-500 to-amber-600",
  "from-amber-400 to-yellow-600",
  "from-lime-500 to-green-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-sky-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-fuchsia-500 to-pink-600",
];

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const DOT_SIZES = {
  xs: "h-2 w-2",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

function hashIndex(name, len) {
  const s = String(name || "?");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % len;
}

export default function Avatar({ name, size = "sm", online }) {
  const gradient = GRADIENTS[hashIndex(name, GRADIENTS.length)];

  return (
    <span className="relative inline-flex flex-none">
      <span
        className={[
          "inline-flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm ring-1 ring-white/15",
          gradient,
          SIZES[size] || SIZES.sm,
        ].join(" ")}
      >
        {initials(name)}
      </span>
      {online != null ? (
        <span
          className={[
            "absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-slate-900",
            DOT_SIZES[size] || DOT_SIZES.sm,
            online ? "bg-emerald-400" : "bg-slate-500",
          ].join(" ")}
          aria-label={online ? "online" : "offline"}
        />
      ) : null}
    </span>
  );
}
