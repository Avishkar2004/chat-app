import React from "react";
import { ChatIcon } from "../ui/icons";

/**
 * An empty state always answers "what do I do now?", not just "there is
 * nothing here". `action` is where the next step goes.
 */
export default function EmptyState({
  title,
  description,
  action,
  tall,
  icon: Icon = ChatIcon,
}) {
  return (
    <div
      className={[
        "grid place-items-center px-6",
        tall ? "h-full" : "min-h-[180px] py-10",
      ].join(" ")}
    >
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-line bg-surface-2 text-fg-subtle">
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-msg font-semibold text-fg">{title}</p>
        {description ? (
          <p className="mt-1.5 text-label leading-relaxed text-fg-muted">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
