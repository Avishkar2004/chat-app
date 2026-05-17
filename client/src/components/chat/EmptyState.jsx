import React from "react";

export default function EmptyState({ title, description, tall }) {
  return (
    <div className={tall ? "grid h-full place-items-center" : "grid h-[200px] place-items-center"}>
      <div className="max-w-md text-center">
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        {description ? (
          <div className="mt-1 text-xs text-slate-400">{description}</div>
        ) : null}
      </div>
    </div>
  );
}
