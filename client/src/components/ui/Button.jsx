import React from "react";

/**
 * The app's only button styles. Keeping them in one place is what enforces the
 * "exactly one filled button in view" rule — `primary` is the filled one and is
 * used for the single most important action on a screen. Everything else is
 * quiet (outlined) or ghost (text only).
 *
 * Colours come from theme tokens only; nothing here hardcodes a hex value.
 */
const BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  /** The one filled action on a screen. */
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  /** Default for everything else: hairline outline on a flat surface. */
  quiet: "border border-line bg-surface text-fg hover:bg-surface-2",
  /** No border — for dense rows and toolbars. */
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  /** Affirmative but not primary (e.g. accepting a request). */
  positive:
    "border border-line bg-positive-soft text-positive-text hover:border-positive/40",
  /** Destructive confirmation. */
  danger: "border border-line bg-danger-soft text-danger-text hover:border-danger/40",
};

const SIZES = {
  sm: "h-9 px-3 text-label",
  md: "h-10 px-4 text-label",
  lg: "h-12 px-5 text-msg",
  icon: "h-10 w-10 px-0",
  iconSm: "h-9 w-9 px-0",
};

export default function Button({
  as: Tag = "button",
  variant = "quiet",
  size = "md",
  block,
  className = "",
  ...props
}) {
  const cls = [
    BASE,
    VARIANTS[variant] || VARIANTS.quiet,
    SIZES[size] || SIZES.md,
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (Tag === "button") {
    return <button type="button" className={cls} {...props} />;
  }
  return <Tag className={cls} {...props} />;
}

/**
 * Icon-only button. `label` is required — it becomes the accessible name and
 * the tooltip, so no control is ever a bare glyph.
 */
export function IconButton({ label, size = "icon", className = "", ...props }) {
  return (
    <Button
      size={size}
      aria-label={label}
      title={label}
      className={className}
      {...props}
    />
  );
}
