import React from "react";
import { ChatIcon } from "../ui/icons";

export default function EmptyState({ title, description, tall, icon: Icon = ChatIcon }) {
  return (
    <div className={tall ? "grid h-full place-items-center" : "grid h-[200px] place-items-center"}>
      <div className="max-w-md text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-slate-800/80 bg-slate-950/40 text-slate-400 ring-1 ring-white/5">
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        {description ? (
          <div className="mt-1 text-xs text-slate-400">{description}</div>
        ) : null}
      </div>
    </div>
  );
}
