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
                  "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                  active
                    ? "border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20"
                    : "border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-9 w-9 flex-none place-items-center rounded-lg text-sm font-bold transition",
                    active
                      ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
                      : "bg-slate-950/60 text-slate-400 group-hover:text-slate-200",
                  ].join(" ")}
                >
                  #
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-slate-100">{room.name}</span>
                    <span className="flex-none text-[11px] text-slate-500">#{room.id}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-400">
                    {room.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
        <h3 className="text-xs font-medium text-slate-300">Tips</h3>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
          <li className="flex gap-2">
            <span className="text-indigo-300">•</span>
            <span>
              <kbd className="rounded bg-slate-800/80 px-1 text-[10px] text-slate-300">Enter</kbd> sends •{" "}
              <kbd className="rounded bg-slate-800/80 px-1 text-[10px] text-slate-300">Shift+Enter</kbd> adds a line
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-300">•</span>
            <span>Share photos, videos and PDFs from the composer</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
