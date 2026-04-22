import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import FriendsPanel from "../components/FriendsPanel";

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

export default function ChatPage() {
  const { user } = useAuth();
  const me = user?.username ? `@${user.username}` : "@you";

  const rooms = useMemo(
    () => [
      { id: "general", name: "General", description: "Announcements + casual chat" },
      { id: "help", name: "Help", description: "Questions, answers, tips" },
      { id: "build", name: "Build in public", description: "Ship updates & feedback" },
    ],
    [],
  );

  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id ?? "general");
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0];

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => {
    const now = Date.now();
    return [
      {
        id: "m1",
        roomId: "general",
        author: "ChatApp",
        handle: "@chatapp",
        body: "Welcome! This is a polished UI shell — you can wire realtime later without changing the layout.",
        ts: now - 1000 * 60 * 18,
      },
      {
        id: "m2",
        roomId: "general",
        author: user?.username || "You",
        handle: me,
        body: "Nice — can I send messages here already?",
        ts: now - 1000 * 60 * 16,
        mine: true,
      },
      {
        id: "m3",
        roomId: "general",
        author: "ChatApp",
        handle: "@chatapp",
        body: "Yep. It’s local-only for now: type below and hit Enter.",
        ts: now - 1000 * 60 * 15,
      },
      {
        id: "m4",
        roomId: "help",
        author: "ChatApp",
        handle: "@chatapp",
        body: "Ask anything here. Later you can connect this to your server/websocket layer.",
        ts: now - 1000 * 60 * 10,
      },
      {
        id: "m5",
        roomId: "build",
        author: "ChatApp",
        handle: "@chatapp",
        body: "Post your latest build update. Keep it short, ship often.",
        ts: now - 1000 * 60 * 6,
      },
    ];
  });

  const listRef = useRef(null);

  const roomMessages = useMemo(
    () => messages.filter((m) => m.roomId === activeRoomId).sort((a, b) => a.ts - b.ts),
    [messages, activeRoomId],
  );

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeRoomId, roomMessages.length]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${now}_${Math.random().toString(16).slice(2)}`,
        roomId: activeRoomId,
        author: user?.username || "You",
        handle: me,
        body: text,
        ts: now,
        mine: true,
      },
    ]);
    setDraft("");
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
            <li>This is UI-only; plug in sockets later</li>
          </ul>
        </div>

        <FriendsPanel />
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
            <div className="text-xs text-slate-400">Connected (mock)</div>
          </div>
        </div>

        <div
          ref={listRef}
          className="h-[58vh] overflow-y-auto px-4 py-4 sm:h-[62vh]"
        >
          <div className="space-y-3">
            {roomMessages.map((m) => (
              <div
                key={m.id}
                className={["flex items-end gap-3", m.mine ? "justify-end" : "justify-start"].join(
                  " ",
                )}
              >
                {!m.mine ? (
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-200">
                    {initials(m.author)}
                  </div>
                ) : null}

                <div className={["max-w-[78%] sm:max-w-[70%]", m.mine ? "text-right" : ""].join(" ")}>
                  <div className={["mb-1 flex items-center gap-2 text-xs", m.mine ? "justify-end" : ""].join(" ")}>
                    <span className="font-medium text-slate-300">{m.mine ? me : m.author}</span>
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

            <button
              onClick={send}
              disabled={!draft.trim()}
              className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

