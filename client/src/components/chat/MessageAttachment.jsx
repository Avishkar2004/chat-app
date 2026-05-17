import React from "react";
import { API_BASE } from "../../api";

export default function MessageAttachment({ attachment }) {
  if (!attachment?.url) return null;

  const src = `${API_BASE}${attachment.url}`;
  const mime = String(attachment.mime || "");

  if (mime.startsWith("image/")) {
    return (
      <img
        src={src}
        alt="attachment"
        className="mb-2 max-h-64 w-auto rounded-xl ring-1 ring-white/10"
      />
    );
  }

  if (mime.startsWith("video/")) {
    return (
      <video
        src={src}
        controls
        className="mb-2 max-h-64 w-auto rounded-xl ring-1 ring-white/10"
      />
    );
  }

  if (mime === "application/pdf") {
    return (
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="mb-2 flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 hover:bg-slate-950/60"
      >
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/20">
          PDF
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">Open PDF</div>
          <div className="text-xs text-slate-400">Tap to view</div>
        </div>
      </a>
    );
  }

  return null;
}
