import React from "react";
import { API_BASE } from "../../api";
import { FileIcon } from "../ui/icons";

/**
 * Photo, video or PDF sent with a message. Photos and PDFs open full size in a
 * new tab; videos play in place.
 */
export default function MessageAttachment({ attachment, onDark = false }) {
  if (!attachment?.url) return null;

  const src = `${API_BASE}${attachment.url}`;
  const mime = String(attachment.mime || "");

  if (mime.startsWith("image/")) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="mb-2 block overflow-hidden rounded-xl border border-line"
        aria-label="Open photo in a new tab"
      >
        <img
          src={src}
          alt="Attachment shared in this chat"
          loading="lazy"
          className="max-h-72 w-auto max-w-full"
        />
      </a>
    );
  }

  if (mime.startsWith("video/")) {
    return (
      <video
        src={src}
        controls
        preload="metadata"
        aria-label="Video sent in this chat"
        className="mb-2 max-h-72 w-auto max-w-full rounded-xl border border-line"
      />
    );
  }

  if (mime === "application/pdf") {
    return (
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className={[
          "mb-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
          onDark
            ? "border-bubble-out-fg/25 hover:bg-bubble-out-fg/10"
            : "border-line bg-surface-2 hover:bg-surface-3",
        ].join(" ")}
      >
        <span
          className={[
            "grid h-10 w-10 flex-none place-items-center rounded-lg",
            onDark ? "bg-bubble-out-fg/15" : "bg-surface-3 text-fg-muted",
          ].join(" ")}
        >
          <FileIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-label font-semibold">
            PDF document
          </span>
          <span
            className={[
              "block text-meta",
              onDark ? "opacity-80" : "text-fg-subtle",
            ].join(" ")}
          >
            Tap to open
          </span>
        </span>
      </a>
    );
  }

  return null;
}
