import React from "react";

/** Two-column chat shell: sidebar + main conversation panel. */
export default function ChatLayout({ sidebar, children }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
        {sidebar}
      </aside>
      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur">
        {children}
      </section>
    </div>
  );
}
