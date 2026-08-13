/** Display initials from a username or display name. */
export function initials(name = "?") {
  const cleaned = String(name).trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

/**
 * "Last seen" line for someone who is offline. Spelled out in words rather
 * than "5m ago", to match the rest of the copy in the app.
 */
export function formatLastSeen(ts) {
  if (!ts) return "";
  const then = new Date(ts);
  if (Number.isNaN(then.getTime())) return "";

  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);
  if (seconds < 60) return "Last seen just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `Last seen ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last seen ${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Last seen yesterday";
  if (days < 7) return `Last seen ${days} days ago`;

  return `Last seen on ${then.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  })}`;
}

/**
 * One line describing where a person is: "Online now", "Last seen …", or an
 * empty string when we have not heard anything about them yet.
 *
 * @param {{online: boolean, lastSeenAt: string|null}|undefined} presence
 */
export function presenceText(presence) {
  if (!presence) return "";
  if (presence.online) return "Online now";
  return formatLastSeen(presence.lastSeenAt) || "Offline";
}

/** Short time label for message timestamps. */
export function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
