import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="text-sm text-slate-400">Signed in as</div>
      <div className="mt-1 text-lg font-semibold">@{user?.username}</div>

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-4 text-slate-300">
        Chat UI goes here next (messages, rooms, realtime).
      </div>
    </div>
  );
}

