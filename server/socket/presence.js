/**
 * Who is online right now, in memory.
 *
 * The registry counts open sockets per user rather than storing a boolean: one
 * person with three tabs open is still one person, and closing one tab must not
 * mark them offline. The count lives in this process only — a restart clears it,
 * which is correct, because every socket is gone at that point too.
 */
const socketCounts = new Map();

/** @returns {boolean} true when this is the user's first open socket. */
export function addPresenceConnection(userId) {
  const key = String(userId);
  const next = (socketCounts.get(key) || 0) + 1;
  socketCounts.set(key, next);
  return next === 1;
}

/** @returns {boolean} true when this was the user's last open socket. */
export function removePresenceConnection(userId) {
  const key = String(userId);
  const next = (socketCounts.get(key) || 0) - 1;
  if (next > 0) {
    socketCounts.set(key, next);
    return false;
  }
  socketCounts.delete(key);
  return true;
}

export function isUserOnline(userId) {
  return socketCounts.has(String(userId));
}
