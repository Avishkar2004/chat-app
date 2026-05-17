import React from "react";

export default function RoomsSidebar({ rooms, activeRoomId, onSelectRoom }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-medium text-slate-400">Rooms</h3>
      <ul className="mt-2 space-y-1">
        {rooms.map((room) => {
          const active = room.id === activeRoomId;
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onSelectRoom(room.id)}
                className={[
                  "w-full rounded-xl border px-3 py-2 text-left transition",
                  active
                    ? "border-indigo-500/40 bg-indigo-500/10"
                    : "border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-100">{room.name}</span>
                  <span className="text-xs text-slate-400">#{room.id}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{room.description}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
        <h3 className="text-xs font-medium text-slate-300">Tips</h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-400">
          <li>Enter sends • Shift+Enter adds a new line</li>
          <li>Send photos/videos from the 📎 button</li>
        </ul>
      </div>
    </div>
  );
}
