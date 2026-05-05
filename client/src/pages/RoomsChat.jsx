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

export default function RoomsChat({ onSwitchTab }) {
  const { user } = useAuth();
  const me = user?.username ? `@${user.username}` : "@you";
  const API_BASE =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

  const rooms = useMemo(
    () => [
      { id: "general", name: "General", description: "Announcements + casual chat" },
      { id: "help", name: "Help", description: "Questions, answers, tips" },
    ],
    [],
  );

  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id ?? "general");
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0];

  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null); // {url, mime, originalName}

  const [messagesByRoom, setMessagesByRoom] = useState({});
  const messages = useMemo(() => messagesByRoom[activeRoomId] || [], [messagesByRoom, activeRoomId]);

  const socketRef = useRef(null);
  const activeRoomIdRef = useRef(activeRoomId);
  const usernameRef = useRef(user?.username || "");
  const typingTimeoutRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const listRef = useRef(null);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    usernameRef.current = user?.username || "";
  }, [user?.username]);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"], withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => {
      setConnected(false);
      setTypingUser("");
    });

    socket.on("message", (message) => {
      if (!message || message.roomId !== activeRoomIdRef.current) return;
      const mine = message.username === usernameRef.current;
      setMessagesByRoom((prev) => {
        const list = prev[message.roomId] || [];
        return {
          ...prev,
          [message.roomId]: [
            ...list,
            {
              id: message.id,
              roomId: message.roomId,
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

    socket.on("typing", (payload) => {
      if (!payload || payload.roomId !== activeRoomIdRef.current) return;
      if (payload.username === usernameRef.current) return;
      setTypingUser(payload.isTyping ? payload.username : "");
      if (payload.isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 1200);
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
    if (!socketRef.current) return;
    const roomId = String(activeRoomId || "").trim();
    if (!roomId) return;
    setTypingUser("");
    socketRef.current.emit("joinRoom", { roomId });
  }, [activeRoomId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeRoomId, messages.length]);

  function send() {
    const text = draft.trim();
    if (!text && !pendingAttachment) return;
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socket.emit("sendMessage", {
      roomId: activeRoomId,
      body: text,
      attachment: pendingAttachment ? { url: pendingAttachment.url, mime: pendingAttachment.mime } : null,
    });
    socket.emit("typing", { roomId: activeRoomId, isTyping: false });
    setDraft("");
    setPendingAttachment(null);
  }

  function onDraftChange(nextValue) {
    setDraft(nextValue);
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    const isTypingNow = String(nextValue || "").trim().length > 0;
    socket.emit("typing", { roomId: activeRoomIdRef.current, isTyping: isTypingNow });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingNow) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { roomId: activeRoomIdRef.current, isTyping: false });
      }, 900);
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
            onClick={() => onSwitchTab?.("friends")}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Friends
          </button>
        </div>

        <div className="mt-4">
          <div className="text-xs font-medium text-slate-400">Rooms</div>
          <div className="mt-2 space-y-1">
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
                    <div className="font-medium text-slate-100">{room.name}</div>
                    <div className="text-xs text-slate-400">#{room.id}</div>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{room.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="text-xs font-medium text-slate-300">Tips</div>
          <ul className="mt-2 space-y-1 text-xs text-slate-400">
            <li>Enter sends • Shift+Enter adds a new line</li>
            <li>Send photos/videos from the 📎 button</li>
          </ul>
        </div>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/30 px-4 py-3">
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-100">
              {activeRoom?.name}
            </div>
            <div className="text-xs text-slate-400">{activeRoom?.description}</div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
            <div className="text-xs text-slate-400">
              {!connected ? "Disconnected" : typingUser ? `${typingUser} is typing…` : "Connected"}
            </div>
          </div>
        </div>

        <div ref={listRef} className="h-[58vh] overflow-y-auto px-4 py-4 sm:h-[62vh]">
          {messages.length ? (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={["flex items-end gap-3", m.mine ? "justify-end" : "justify-start"].join(" ")}>
                  {!m.mine ? (
                    <div className="w-9 flex-none">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 text-xs font-semibold text-slate-100 shadow-sm">
                        {initials(m.author)}
                      </div>
                    </div>
                  ) : null}

                  <div className={["min-w-0 flex flex-col", m.mine ? "items-end text-right" : "items-start"].join(" ")}>
                    <div className={["mb-1 flex items-center gap-2 text-[11px]", m.mine ? "justify-end" : ""].join(" ")}>
                      <span className="font-semibold text-slate-200">{m.mine ? me : `@${m.author}`}</span>
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
                  Start chatting in #{activeRoom?.id}.
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
                placeholder={`Message #${activeRoom?.id}`}
                className="max-h-36 w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
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
                disabled={uploading}
                className="grid h-11 w-11 place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-slate-200 hover:bg-slate-950/60 disabled:cursor-not-allowed disabled:opacity-60"
                title="Photo / Video"
                aria-label="Photo / Video"
              >
                📎
              </button>

              <button
                onClick={send}
                disabled={!draft.trim() && !pendingAttachment}
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

