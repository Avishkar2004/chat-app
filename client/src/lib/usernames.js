/** Strip leading @ and whitespace from a handle input. */
export function normalizeHandle(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.startsWith("@") ? s.slice(1) : s;
}

/** Format a username for display (e.g. "john" → "@john"). */
export function displayHandle(username) {
  const u = String(username || "").trim();
  return u ? `@${u}` : "";
}
