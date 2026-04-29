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
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function normalizeHandle(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.startsWith("@") ? s.slice(1) : s;
}

export default function ChatPage() {
  const { user } = useAuth();
  const me = user?.username ? `@${user.username}` : "@you";
  const API_BASE =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
  const [tab, setTab] = useState("rooms"); // "rooms" | "friends"

  const rooms = useMemo(
    () => [
      {
        id: "general",
        name: "General",
        description: "Announcements + casual chat",
      },
      { id: "help", name: "Help", description: "Questions, answers, tips" },
      {
        id: "build",
        name: "Build in public",
        description: "Ship updates & feedback",
      },
    ],
    [],
  );

  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id ?? "general");
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0];

  const [roomDraft, setRoomDraft] = useState("");
  // Room messages come from Socket.IO (real-time).
  const [roomMessagesByRoom, setRoomMessagesByRoom] = useState({});

  // Socket.IO state for public rooms chat
  const socketRef = useRef(null);
  const activeRoomIdRef = useRef(activeRoomId);
  const usernameRef = useRef(user?.username || "");
  const typingTimeoutRef = useRef(null);

  const [socketConnected, setSocketConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  // Friends state
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState("");
  const [friendsState, setFriendsState] = useState({
    friends: [],
    incoming: [],
    outgoing: [],
  });
  const [friendUsername, setFriendUsername] = useState("");
  const [friendsSubmitting, setFriendsSubmitting] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null); // {id, username}

  // DM threads are local-only for now
  const [dmDraft, setDmDraft] = useState("");
  const [dmThreads, setDmThreads] = useState(() => ({})); // username -> messages[]

  const listRef = useRef(null);

  const roomMessages = useMemo(
    () => roomMessagesByRoom[activeRoomId] || [],
    [roomMessagesByRoom, activeRoomId],
  );

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    usernameRef.current = user?.username || "";
  }, [user?.username]);

  useEffect(() => {
    const socket = io(API_BASE, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    // Connection state (shows in the header).
    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      setTypingUser("");
    });

    // Receive incoming messages from the server.
    socket.on("message", (message) => {
      if (!message || message.roomId !== activeRoomIdRef.current) return;

      const mine = message.username === usernameRef.current;
      setRoomMessagesByRoom((prev) => {
        const list = prev[message.roomId] || [];
        return {
          ...prev,
          [message.roomId]: [
            ...list,
            {
              id: message.id,
              roomId: message.roomId,
              author: message.username,
              body: message.body,
              ts: message.ts,
              mine,
            },
          ],
        };
      });
    });

    socket.on("typing", (payload) => {
      if (!payload || payload.roomId !== activeRoomIdRef.current) return;
      if (payload.username === usernameRef.current) return;

      if (payload.isTyping) {
        setTypingUser(payload.username);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser((cur) => (cur === payload.username ? "" : cur));
        }, 1200);
      } else {
        setTypingUser((cur) => (cur === payload.username ? "" : cur));
      }
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
    if (tab !== "rooms") return;
    if (!socketRef.current) return;
    const safeUsername = usernameRef.current;
    const safeRoomId = String(activeRoomId || "").trim();
    if (!safeRoomId || !safeUsername) return;

    setTypingUser("");
    socketRef.current.emit("joinRoom", {
      roomId: safeRoomId,
      username: safeUsername,
    });
  }, [tab, activeRoomId, user?.username]);

  useEffect(() => {
    if (tab !== "rooms") return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [tab, activeRoomId, roomMessages.length]);

  function sendRoom() {
    const text = roomDraft.trim();
    if (!text) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (!socketRef.current || !socketRef.current.connected) return;
    socketRef.current.emit("sendMessage", {
      roomId: activeRoomId,
      body: text,
    });

    socketRef.current.emit("typing", {
      roomId: activeRoomId,
      isTyping: false,
    });
    setRoomDraft("");
  }

  function handleRoomDraftChange(nextValue) {
    setRoomDraft(nextValue);

    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    const roomId = activeRoomIdRef.current;
    const isTypingNow = String(nextValue || "").trim().length > 0;

    // Tell others in the room that the current user is typing.
    socket.emit("typing", { roomId, isTyping: isTypingNow });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingNow) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { roomId, isTyping: false });
      }, 900);
    }
  }

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
        if (cur && next.friends.some((f) => f.username === cur.username))
          return cur;
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

  const dmMessages = useMemo(() => {
    const key = selectedFriend?.username || "";
    return dmThreads[key] || [];
  }, [dmThreads, selectedFriend]);

  useEffect(() => {
    if (tab !== "friends") return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [tab, selectedFriend?.username, dmMessages.length]);

  function sendDm() {
    const text = dmDraft.trim();
    if (!text || !selectedFriend) return;
    const now = Date.now();
    const friendU = selectedFriend.username;
    setDmThreads((prev) => {
      const cur = prev[friendU] || [];
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
      return { ...prev, [friendU]: next };
    });
    setDmDraft("");
  }

  async function sendFriendRequest() {
    const u = normalizeHandle(friendUsername);
    if (!u) return;
    setFriendsSubmitting(true);
    setFriendsError("");
    try {
      await api("/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
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
      await api("/api/friends/accept", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
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
      await api("/api/friends/decline", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
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
      await api("/api/friends/remove", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      });
      setDmThreads((prev) => {
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
          <div className="hidden rounded-full border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-300 sm:inline-flex">
            Online
          </div>
        </div>

        <div className="mt-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setTab("rooms")}
                className={[
                  "rounded-lg px-3 py-2 text-xs font-semibold transition",
                  tab === "rooms"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-950/50",
                ].join(" ")}
              >
                Rooms
              </button>
              <button
                onClick={() => setTab("friends")}
                className={[
                  "rounded-lg px-3 py-2 text-xs font-semibold transition",
                  tab === "friends"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-950/50",
                ].join(" ")}
              >
                Friends
              </button>
            </div>
          </div>

          {tab === "rooms" ? (
            <div className="mt-3 space-y-1">
              {rooms.map((room) => {
                const active = room.id === activeRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={[
                      "w-full rounded-xl border px-3 py-2 text-left transition",
                      active
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-slate-100">
                        {room.name}
                      </div>
                      <div className="text-xs text-slate-400">#{room.id}</div>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {room.description}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <input
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  placeholder="Add by username (e.g. @john)"
                  className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
                />
                <button
                  onClick={sendFriendRequest}
                  disabled={
                    normalizeHandle(friendUsername).length < 3 ||
                    friendsSubmitting
                  }
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
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-300">
                          Requests
                        </div>
                        <button
                          onClick={refreshFriends}
                          disabled={friendsSubmitting}
                          className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-950/60 disabled:opacity-60"
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {friendsState.incoming.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                          >
                            <div className="text-xs text-slate-200">
                              @{u.username}
                            </div>
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
                          const active =
                            selectedFriend?.username === f.username;
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
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-[11px] font-semibold text-slate-200">
                                  {initials(f.username)}
                                </div>
                                <div className="text-xs font-medium text-slate-100">
                                  @{f.username}
                                </div>
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
                        <div className="text-xs text-slate-500">
                          No friends yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="text-xs font-medium text-slate-300">Tips</div>
          <ul className="mt-2 space-y-1 text-xs text-slate-400">
            <li>Enter sends • Shift+Enter adds a new line</li>
            <li>This is UI-only; plug in sockets later</li>
          </ul>
        </div>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/30 px-4 py-3">
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-100">
              {tab === "rooms"
                ? activeRoom?.name
                : selectedFriend
                  ? `@${selectedFriend.username}`
                  : "Select a friend"}
            </div>
            <div className="text-xs text-slate-400">
              {tab === "rooms"
                ? activeRoom?.description
                : selectedFriend
                  ? "Direct messages (mock, local-only)"
                  : "Choose a friend from the left to start chatting."}
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
            <div className="text-xs text-slate-400">
              {socketConnected
                ? typingUser
                  ? `${typingUser} is typing…`
                  : "Connected"
                : "Disconnected"}
            </div>
          </div>
        </div>

        <div
          ref={listRef}
          className="h-[58vh] overflow-y-auto px-4 py-4 sm:h-[62vh]"
        >
          {tab === "friends" && !selectedFriend ? (
            <div className="grid h-full place-items-center">
              <div className="max-w-md text-center">
                <div className="text-sm font-semibold text-slate-100">
                  No friend selected
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Select a friend on the left to start a direct message.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(tab === "rooms" ? roomMessages : dmMessages).length ? (
                (tab === "rooms" ? roomMessages : dmMessages).map((m) => (
                  <div
                    key={m.id}
                    className={[
                      "flex items-end gap-3",
                      m.mine ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {!m.mine ? (
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-200">
                        {initials(
                          tab === "rooms" ? m.author : selectedFriend?.username,
                        )}
                      </div>
                    ) : null}

                    <div className={m.mine ? "text-right" : ""}>
                      <div
                        className={[
                          "mb-1 flex items-center gap-2 text-xs",
                          m.mine ? "justify-end" : "",
                        ].join(" ")}
                      >
                        <span className="font-medium text-slate-300">
                          {m.mine
                            ? me
                            : tab === "rooms"
                              ? m.author
                              : `@${selectedFriend?.username}`}
                        </span>
                        <span className="text-slate-500">{formatTime(m.ts)}</span>
                      </div>
                      <div
                        className={[
                          "w-fit max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm break-words",
                          m.mine
                            ? "border-indigo-500/30 bg-indigo-500/15 text-slate-50 ml-auto"
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
                ))
              ) : (
                <div className="grid h-[200px] place-items-center">
                  <div className="max-w-md text-center">
                    <div className="text-sm font-semibold text-slate-100">
                      {tab === "rooms" ? "No messages yet" : "No direct messages yet"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {tab === "rooms"
                        ? `Start chatting in #${activeRoom?.id}.`
                        : selectedFriend
                          ? `Say hi to @${selectedFriend.username}.`
                          : "Select a friend to start chatting."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800/80 bg-slate-950/30 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-3 py-2">
              <textarea
                value={tab === "rooms" ? roomDraft : dmDraft}
                onChange={(e) => {
                  const value = e.target.value;
                  if (tab === "rooms") handleRoomDraftChange(value);
                  else setDmDraft(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    tab === "rooms" ? sendRoom() : sendDm();
                  }
                }}
                rows={1}
                disabled={tab === "friends" && !selectedFriend}
                placeholder={
                  tab === "rooms"
                    ? `Message #${activeRoom?.id}`
                    : selectedFriend
                      ? `Message @${selectedFriend.username}`
                      : "Select a friend to start chatting"
                }
                className="max-h-36 w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-70"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Shift+Enter for new line</span>
                <span>
                  {(
                    tab === "rooms"
                      ? roomDraft.trim().length
                      : dmDraft.trim().length
                  )
                    ? `${tab === "rooms" ? roomDraft.trim().length : dmDraft.trim().length} chars`
                    : ""}
                </span>
              </div>
            </div>

            <button
              onClick={() => (tab === "rooms" ? sendRoom() : sendDm())}
              disabled={
                tab === "rooms"
                  ? !roomDraft.trim()
                  : !selectedFriend || !dmDraft.trim()
              }
              aria-label="Send message"
              title="Send"
              className={[
                "inline-flex h-11 flex-none items-center justify-center overflow-hidden rounded-xl border border-slate-800/80 bg-indigo-600 text-white shadow-sm transition-all duration-150 ease-out hover:bg-indigo-500 disabled:cursor-not-allowed disabled:border-slate-800/80 disabled:bg-slate-950/40 disabled:text-slate-500",
                (tab === "rooms" ? roomDraft.trim() : selectedFriend && dmDraft.trim())
                  ? "w-11 px-0"
                  : "w-24 px-3",
              ].join(" ")}
            >
              {tab === "rooms" ? (
                roomDraft.trim() ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 animate-send-pop"
                    aria-hidden="true"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22 11 13 2 9 22 2z" />
                  </svg>
                ) : (
                  <span className="animate-send-pop text-sm font-semibold">Send</span>
                )
              ) : selectedFriend && dmDraft.trim() ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 animate-send-pop"
                  aria-hidden="true"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22 11 13 2 9 22 2z" />
                </svg>
              ) : (
                <span className="animate-send-pop text-sm font-semibold">Send</span>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
