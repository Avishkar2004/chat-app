import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

function normalizeHandle(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.startsWith("@") ? s.slice(1) : s;
}

function initials(name = "?") {
  const cleaned = String(name).trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function FriendsChat() {
  const { user } = useAuth();
  const me = user?.username ? `@${user.username}` : "@you";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [state, setState] = useState({ friends: [], incoming: [], outgoing: [] });

  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [selected, setSelected] = useState(null); // { id, username }
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState(() => ({})); // username -> messages[]
  const listRef = useRef(null);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/friends/state");
      const next = {
        friends: data.friends || [],
        incoming: data.incoming || [],
        outgoing: data.outgoing || [],
      };
      setState(next);
      setSelected((cur) => {
        if (cur && next.friends.some((f) => f.username === cur.username)) return cur;
        return next.friends[0] || null;
      });
    } catch (e) {
      setError(e.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSendRequest = useMemo(
    () => normalizeHandle(username).length >= 3,
    [username],
  );

  const selectedKey = selected?.username || "";
  const messages = useMemo(() => threads[selectedKey] || [], [threads, selectedKey]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [selectedKey, messages.length]);

  async function sendRequest() {
    const u = normalizeHandle(username);
    if (!u) return;
    setSubmitting(true);
    setError("");
    try {
      await api("/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
      setUsername("");
      await refresh();
    } catch (e) {
      setError(e.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  }

  async function accept(u) {
    setSubmitting(true);
    setError("");
    try {
      await api("/api/friends/accept", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
      await refresh();
    } catch (e) {
      setError(e.message || "Failed to accept request");
    } finally {
      setSubmitting(false);
    }
  }

  async function decline(u) {
    setSubmitting(true);
    setError("");
    try {
      await api("/api/friends/decline", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
      await refresh();
    } catch (e) {
      setError(e.message || "Failed to decline request");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(u) {
    setSubmitting(true);
    setError("");
    try {
      await api("/api/friends/remove", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
      setThreads((prev) => {
        const next = { ...prev };
        delete next[u];
        return next;
      });
      await refresh();
    } catch (e) {
      setError(e.message || "Failed to remove friend");
    } finally {
      setSubmitting(false);
    }
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text || !selected) return;
    const now = Date.now();
    const friendUsername = selected.username;

    setThreads((prev) => {
      const cur = prev[friendUsername] || [];
      const next = [
        ...cur,
        {
          id: `dm_${now}_${Math.random().toString(16).slice(2)}`,
          author: user?.username || "You",
          body: text,
          ts: now,
          mine: true,
        },
      ];
      return { ...prev, [friendUsername]: next };
    });
    setDraft("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight text-slate-100">Friends</div>
          <button
            onClick={refresh}
            disabled={loading || submitting}
            className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-xs text-slate-300 hover:bg-slate-950/60 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Add by username (e.g. @john)"
            className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
          />
          <button
            onClick={sendRequest}
            disabled={!canSendRequest || submitting}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-3 text-xs text-slate-500">Loading…</div>
        ) : (
          <div className="mt-4 space-y-4">
            {state.incoming?.length ? (
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Requests ({state.incoming.length})
                </div>
                <div className="mt-2 space-y-1.5">
                  {state.incoming.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                    >
                      <div className="text-xs text-slate-200">@{u.username}</div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => accept(u.username)}
                          disabled={submitting}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => decline(u.username)}
                          disabled={submitting}
                          className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60 disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {state.outgoing?.length ? (
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Sent ({state.outgoing.length})
                </div>
                <div className="mt-2 space-y-1.5">
                  {state.outgoing.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                    >
                      <div className="text-xs text-slate-200">@{u.username}</div>
                      <div className="text-[11px] text-slate-500">Request Pending</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <div className="text-xs font-medium text-slate-400">
                Friends ({state.friends?.length || 0})
              </div>
              <div className="mt-2 space-y-1.5">
                {state.friends?.length ? (
                  state.friends.map((u) => {
                    const active = selected?.username === u.username;
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelected(u)}
                        className={[
                          "flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                          active
                            ? "border-indigo-500/40 bg-indigo-500/10"
                            : "border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-[11px] font-semibold text-slate-200">
                            {initials(u.username)}
                          </div>
                          <div className="text-xs font-medium text-slate-100">@{u.username}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            remove(u.username);
                          }}
                          disabled={submitting}
                          className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-500">No friends yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/30 px-4 py-3">
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-100">
              {selected ? `@${selected.username}` : "Select a friend"}
            </div>
            <div className="text-xs text-slate-400">
              {selected ? "Direct message (mock, local-only)" : "Choose a friend from the list to start chatting."}
            </div>
          </div>
        </div>

        <div ref={listRef} className="h-[58vh] overflow-y-auto px-4 py-4 sm:h-[62vh]">
          {!selected ? (
            <div className="grid h-full place-items-center">
              <div className="max-w-md text-center">
                <div className="text-sm font-semibold text-slate-100">No friend selected</div>
                <div className="mt-1 text-xs text-slate-400">
                  Pick a friend on the left, then send a message.
                </div>
              </div>
            </div>
          ) : messages.length ? (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={["flex items-end gap-3", m.mine ? "justify-end" : "justify-start"].join(" ")}
                >
                  {!m.mine ? (
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-200">
                      {initials(selected.username)}
                    </div>
                  ) : null}

                  <div className={["max-w-[78%] sm:max-w-[70%]", m.mine ? "text-right" : ""].join(" ")}>
                    <div className={["mb-1 flex items-center gap-2 text-xs", m.mine ? "justify-end" : ""].join(" ")}>
                      <span className="font-medium text-slate-300">
                        {m.mine ? me : `@${selected.username}`}
                      </span>
                      <span className="text-slate-500">{formatTime(m.ts)}</span>
                    </div>
                    <div
                      className={[
                        "rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm",
                        m.mine
                          ? "border-indigo-500/30 bg-indigo-500/15 text-slate-50"
                          : "border-slate-800/80 bg-slate-950/40 text-slate-200",
                      ].join(" ")}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {m.body}
                    </div>
                  </div>

                  {m.mine ? (
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-200">
                      {initials(user?.username || "You")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid h-full place-items-center">
              <div className="max-w-md text-center">
                <div className="text-sm font-semibold text-slate-100">Say hi</div>
                <div className="mt-1 text-xs text-slate-400">
                  Send your first message to @{selected.username}.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800/80 bg-slate-950/30 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-3 py-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                disabled={!selected}
                placeholder={selected ? `Message @${selected.username}` : "Select a friend to start chatting"}
                className="max-h-36 w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-70"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Shift+Enter for new line</span>
                <span>{draft.trim().length ? `${draft.trim().length} chars` : ""}</span>
              </div>
            </div>

            <button
              onClick={sendMessage}
              disabled={!selected || !draft.trim()}
              aria-label="Send message"
              title="Send"
              className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-slate-800/80 bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:border-slate-800/80 disabled:bg-slate-950/40 disabled:text-slate-500"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22 11 13 2 9 22 2z" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

