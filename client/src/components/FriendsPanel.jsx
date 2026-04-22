import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

function normalizeHandle(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.startsWith("@") ? s.slice(1) : s;
}

function avatarText(username) {
  const u = String(username || "?").trim();
  return u ? u.slice(0, 2).toUpperCase() : "?";
}

export default function FriendsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [state, setState] = useState({ friends: [], incoming: [], outgoing: [] });
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/friends/state");
      setState({
        friends: data.friends || [],
        incoming: data.incoming || [],
        outgoing: data.outgoing || [],
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

  const canSend = useMemo(() => normalizeHandle(username).length >= 3, [username]);

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
      await refresh();
    } catch (e) {
      setError(e.message || "Failed to remove friend");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-300">Friends</div>
        <button
          onClick={refresh}
          disabled={loading || submitting}
          className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-950/60 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add by username (e.g. @john)"
          className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
        />
        <button
          onClick={sendRequest}
          disabled={!canSend || submitting}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>

      {error ? (
        <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-3 text-xs text-slate-500">Loading…</div>
      ) : (
        <div className="mt-3 space-y-3">
          {state.incoming?.length ? (
            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                Requests ({state.incoming.length})
              </div>
              <div className="mt-2 space-y-1.5">
                {state.incoming.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-[10px] font-semibold text-slate-200">
                        {avatarText(u.username)}
                      </div>
                      <div className="text-xs text-slate-200">@{u.username}</div>
                    </div>
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
              <div className="text-[11px] font-semibold text-slate-400">
                Sent ({state.outgoing.length})
              </div>
              <div className="mt-2 space-y-1.5">
                {state.outgoing.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-[10px] font-semibold text-slate-200">
                        {avatarText(u.username)}
                      </div>
                      <div className="text-xs text-slate-200">@{u.username}</div>
                    </div>
                    <div className="text-[11px] text-slate-500">Pending</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <div className="text-[11px] font-semibold text-slate-400">
              Friends ({state.friends?.length || 0})
            </div>
            <div className="mt-2 space-y-1.5">
              {state.friends?.length ? (
                state.friends.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-[10px] font-semibold text-slate-200">
                        {avatarText(u.username)}
                      </div>
                      <div className="text-xs text-slate-200">@{u.username}</div>
                    </div>
                    <button
                      onClick={() => remove(u.username)}
                      disabled={submitting}
                      className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">No friends yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

