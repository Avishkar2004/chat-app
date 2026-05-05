import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { io } from "socket.io-client";

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

function normalizeHandle(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.startsWith("@") ? s.slice(1) : s;
}

export default function FriendsChat({ onSwitchTab }) {
  const { user } = useAuth();
  const me = user?.username ? `@${user.username}` : "@you";
  const API_BASE =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState("");
  const [friendsState, setFriendsState] = useState({ friends: [], incoming: [], outgoing: [] });
  const [friendUsername, setFriendUsername] = useState("");
  const [friendsSubmitting, setFriendsSubmitting] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null); // {id, username}

  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const [threads, setThreads] = useState(() => ({})); // friendUsername -> messages[]
  const messages = useMemo(
    () => (selectedFriend?.username ? threads[selectedFriend.username] || [] : []),
    [threads, selectedFriend?.username],
  );

  const socketRef = useRef(null);
  const usernameRef = useRef(user?.username || "");
  const selectedFriendRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const listRef = useRef(null);

  useEffect(() => {
    usernameRef.current = user?.username || "";
  }, [user?.username]);

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  async function refreshFriends() {
    setFriendsError("");
    setFriendsLoading(true);
    try {
      const data = await api("/api/friends/state");
      const next = {
        friends: data.friends || [],
        incoming: data.incoming || [],
        outgoing: data.outgoing || [],
      };
      setFriendsState(next);
      setSelectedFriend((cur) => {
        if (cur && next.friends.some((f) => f.username === cur.username)) return cur;
        return next.friends[0] || null;
      });
    } catch (e) {
      setFriendsError(e.message || "Failed to load friends");
    } finally {
      setFriendsLoading(false);
    }
  }

  useEffect(() => {
    refreshFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"], withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => {
      setConnected(false);
      setTypingUser("");
    });

    socket.on("dmMessage", (message) => {
      if (!message) return;
      const mine = message.username === usernameRef.current;
      const friendKey = mine ? message.to : message.username;
      setThreads((prev) => {
        const list = prev[friendKey] || [];
        return {
          ...prev,
          [friendKey]: [
            ...list,
            {
              id: message.id,
              author: message.username,
              body: message.body || "",
              attachment: message.attachment || null,
              ts: message.ts,
              mine,
            },
          ],
        };
      });
    });

    socket.on("dmTyping", (payload) => {
      if (!payload) return;
      if (payload.username === usernameRef.current) return;
      if (!selectedFriendRef.current) return;
      if (payload.username !== selectedFriendRef.current.username) return;
      setTypingUser(payload.isTyping ? payload.username : "");
    });

    return () => {
      try {
        socket.disconnect();
      } catch {
        // ignore
      }
    };
  }, [API_BASE]);

  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected) return;
    if (!selectedFriend?.username) return;
    setTypingUser("");
    socketRef.current.emit("joinDm", { friendUsername: selectedFriend.username });
  }, [selectedFriend?.username]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [selectedFriend?.username, messages.length]);

  async function sendFriendRequest() {
    const u = normalizeHandle(friendUsername);
    if (!u) return;
    setFriendsSubmitting(true);
    setFriendsError("");
    try {
      await api("/api/friends/request", { method: "POST", body: JSON.stringify({ username: u }) });
      setFriendUsername("");
      await refreshFriends();
    } catch (e) {
      setFriendsError(e.message || "Failed to send request");
    } finally {
      setFriendsSubmitting(false);
    }
  }

  async function acceptFriend(u) {
    setFriendsSubmitting(true);
    setFriendsError("");
    try {
      await api("/api/friends/accept", { method: "POST", body: JSON.stringify({ username: u }) });
      await refreshFriends();
    } catch (e) {
      setFriendsError(e.message || "Failed to accept request");
    } finally {
      setFriendsSubmitting(false);
    }
  }

  async function declineFriend(u) {
    setFriendsSubmitting(true);
    setFriendsError("");
    try {
      await api("/api/friends/decline", { method: "POST", body: JSON.stringify({ username: u }) });
      await refreshFriends();
    } catch (e) {
      setFriendsError(e.message || "Failed to decline request");
    } finally {
      setFriendsSubmitting(false);
    }
  }

  async function removeFriend(u) {
    setFriendsSubmitting(true);
    setFriendsError("");
    try {
      await api("/api/friends/remove", { method: "POST", body: JSON.stringify({ username: u }) });
      setThreads((prev) => {
        const next = { ...prev };
        delete next[u];
        return next;
      });
      await refreshFriends();
    } catch (e) {
      setFriendsError(e.message || "Failed to remove friend");
    } finally {
      setFriendsSubmitting(false);
    }
  }

  async function uploadAttachment(file) {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const data = await api("/api/uploads", { method: "POST", body: form });
      setPendingAttachment(data);
    } finally {
      setUploading(false);
    }
  }

  function insertEmoji(emoji) {
    if (!emoji) return;
    setDraft((d) => `${d}${emoji}`);
  }

  function onDraftChange(nextValue) {
    setDraft(nextValue);
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    if (!selectedFriendRef.current?.username) return;
    const isTypingNow = String(nextValue || "").trim().length > 0;
    socket.emit("dmTyping", {
      friendUsername: selectedFriendRef.current.username,
      isTyping: isTypingNow,
    });
  }

  function send() {
    const text = draft.trim();
    if ((!text && !pendingAttachment) || !selectedFriend) return;
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    socket.emit("dmMessage", {
      friendUsername: selectedFriend.username,
      body: text,
      attachment: pendingAttachment ? { url: pendingAttachment.url, mime: pendingAttachment.mime } : null,
    });
    socket.emit("dmTyping", { friendUsername: selectedFriend.username, isTyping: false });
    setDraft("");
    setPendingAttachment(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Signed in as</div>
            <div className="mt-0.5 text-base font-semibold tracking-tight text-slate-100">
              @{user?.username}
            </div>
          </div>
          <button
            onClick={() => onSwitchTab?.("rooms")}
            className="rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-950/60"
          >
            Rooms
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              placeholder="Add by username (e.g. @john)"
              className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
            />
            <button
              onClick={sendFriendRequest}
              disabled={normalizeHandle(friendUsername).length < 3 || friendsSubmitting}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add
            </button>
          </div>

          {friendsError ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-100">
              {friendsError}
            </div>
          ) : null}

          {friendsLoading ? (
            <div className="text-xs text-slate-500">Loading…</div>
          ) : (
            <>
              {friendsState.incoming?.length ? (
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Requests ({friendsState.incoming.length})
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {friendsState.incoming.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                      >
                        <div className="text-xs text-slate-200">@{u.username}</div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => acceptFriend(u.username)}
                            disabled={friendsSubmitting}
                            className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineFriend(u.username)}
                            disabled={friendsSubmitting}
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

              <div>
                <div className="text-xs font-medium text-slate-400">
                  Friends ({friendsState.friends?.length || 0})
                </div>
                <div className="mt-2 space-y-1.5">
                  {friendsState.friends?.length ? (
                    friendsState.friends.map((f) => {
                      const active = selectedFriend?.username === f.username;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFriend(f)}
                          className={[
                            "flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                            active
                              ? "border-indigo-500/40 bg-indigo-500/10"
                              : "border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 text-[11px] font-semibold text-slate-100 shadow-sm">
                              {initials(f.username)}
                            </div>
                            <div className="text-xs font-medium text-slate-100">@{f.username}</div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFriend(f.username);
                            }}
                            disabled={friendsSubmitting}
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
            </>
          )}
        </div>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/30 px-4 py-3">
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-100">
              {selectedFriend ? `@${selectedFriend.username}` : "Select a friend"}
            </div>
            <div className="text-xs text-slate-400">
              {selectedFriend ? "Direct messages" : "Pick a friend to start chatting."}
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
            <div className="text-xs text-slate-400">
              {!connected ? "Disconnected" : typingUser ? `${typingUser} is typing…` : "Connected"}
            </div>
          </div>
        </div>

        <div ref={listRef} className="h-[58vh] overflow-y-auto px-4 py-4 sm:h-[62vh]">
          {!selectedFriend ? (
            <div className="grid h-full place-items-center">
              <div className="max-w-md text-center">
                <div className="text-sm font-semibold text-slate-100">No friend selected</div>
                <div className="mt-1 text-xs text-slate-400">
                  Select a friend on the left to start a direct message.
                </div>
              </div>
            </div>
          ) : messages.length ? (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={["flex items-end gap-3", m.mine ? "justify-end" : "justify-start"].join(" ")}>
                  {!m.mine ? (
                    <div className="w-9 flex-none">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 text-xs font-semibold text-slate-100 shadow-sm">
                        {initials(selectedFriend.username)}
                      </div>
                    </div>
                  ) : null}

                  <div className={["min-w-0 flex flex-col", m.mine ? "items-end text-right" : "items-start"].join(" ")}>
                    <div className={["mb-1 flex items-center gap-2 text-[11px]", m.mine ? "justify-end" : ""].join(" ")}>
                      <span className="font-semibold text-slate-200">
                        {m.mine ? me : `@${selectedFriend.username}`}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500">{formatTime(m.ts)}</span>
                    </div>
                    <div
                      className={[
                        "group relative inline-flex max-w-[min(85%,36rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ring-1",
                        m.mine
                          ? "bg-gradient-to-br from-indigo-600/30 via-indigo-500/15 to-fuchsia-500/10 text-slate-50 ring-indigo-500/30 shadow-indigo-600/10"
                          : "bg-slate-950/45 text-slate-100 ring-slate-800/80",
                      ].join(" ")}
                    >
                      {m.attachment?.url ? (
                        <div className="mb-2">
                          {String(m.attachment.mime || "").startsWith("image/") ? (
                            <img
                              src={`${API_BASE}${m.attachment.url}`}
                              alt="attachment"
                              className="max-h-64 w-auto rounded-xl ring-1 ring-white/10"
                            />
                          ) : String(m.attachment.mime || "").startsWith("video/") ? (
                            <video
                              src={`${API_BASE}${m.attachment.url}`}
                              controls
                              className="max-h-64 w-auto rounded-xl ring-1 ring-white/10"
                            />
                          ) : null}
                        </div>
                      ) : null}
                      {m.body}
                    </div>
                  </div>

                  {m.mine ? (
                    <div className="w-9 flex-none">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 text-xs font-semibold text-slate-100 shadow-sm">
                        {initials(user?.username || "You")}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid h-[200px] place-items-center">
              <div className="max-w-md text-center">
                <div className="text-sm font-semibold text-slate-100">No messages yet</div>
                <div className="mt-1 text-xs text-slate-400">
                  Say hi to @{selectedFriend.username}.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800/80 bg-slate-950/30 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-3 py-2">
              {pendingAttachment ? (
                <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-slate-200">
                      {pendingAttachment.originalName || "Attachment"}
                    </div>
                    <div className="text-[11px] text-slate-500">{pendingAttachment.mime}</div>
                  </div>
                  <button
                    onClick={() => setPendingAttachment(null)}
                    className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <textarea
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                disabled={!selectedFriend}
                placeholder={selectedFriend ? `Message @${selectedFriend.username}` : "Select a friend to start chatting"}
                className="max-h-36 w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-70"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Shift+Enter for new line</span>
                <span>{draft.trim().length ? `${draft.trim().length} chars` : ""}</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                await uploadAttachment(file);
              }}
            />

            <div className="flex flex-none items-center gap-2">
              <button
                onClick={() => setEmojiOpen((v) => !v)}
                className="grid h-11 w-11 place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-slate-200 hover:bg-slate-950/60"
                title="Emoji"
                aria-label="Emoji"
              >
                🙂
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !selectedFriend}
                className="grid h-11 w-11 place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-slate-200 hover:bg-slate-950/60 disabled:cursor-not-allowed disabled:opacity-60"
                title="Photo / Video"
                aria-label="Photo / Video"
              >
                📎
              </button>

              <button
                onClick={send}
                disabled={!selectedFriend || (!draft.trim() && !pendingAttachment)}
                aria-label="Send message"
                title="Send"
                className={[
                  "inline-flex h-11 flex-none items-center justify-center overflow-hidden rounded-xl border border-slate-800/80 bg-indigo-600 text-white shadow-sm transition-all duration-150 ease-out hover:bg-indigo-500 disabled:cursor-not-allowed disabled:border-slate-800/80 disabled:bg-slate-950/40 disabled:text-slate-500",
                  draft.trim() || pendingAttachment ? "w-11 px-0" : "w-24 px-3",
                ].join(" ")}
              >
                {draft.trim() || pendingAttachment ? (
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
                ) : (
                  <span className="text-sm font-semibold">Send</span>
                )}
              </button>
            </div>
          </div>

          {emojiOpen ? (
            <div className="mt-3 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-300">Emojis</div>
                <button
                  onClick={() => setEmojiOpen(false)}
                  className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["😀","😁","😂","🥹","😍","😘","😎","🤝","🙏","🔥","❤️","🎉","👍","👀","✅","😅","🤔","😢","😡","🚀"].map((em) => (
                  <button
                    key={em}
                    onClick={() => insertEmoji(em)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-lg hover:bg-slate-950/60"
                    aria-label={`emoji ${em}`}
                    title={em}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

