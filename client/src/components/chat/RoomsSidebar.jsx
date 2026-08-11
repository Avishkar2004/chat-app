import React from "react";
import { CheckIcon, UsersIcon } from "../ui/icons";

/**
 * The "Group chats" tab. Everyone signed in can read and write in these, so
 * each row says what the group is for rather than showing a channel id.
 */
export default function RoomsSidebar({ rooms, activeRoomId, onSelectRoom }) {
  return (
    <div
      id="panel-groups"
      role="tabpanel"
      aria-labelledby="tab-groups"
      className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-3 py-3"
    >
      <h2 className="mb-2 text-meta font-semibold uppercase tracking-wide text-fg-subtle">
        Open to everyone
      </h2>
      <ul className="space-y-1">
        {rooms.map((room) => {
          const active = room.id === activeRoomId;
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onSelectRoom(room.id)}
                aria-current={active ? "true" : undefined}
                className={[
                  "flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition",
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-transparent hover:bg-surface-2",
                ].join(" ")}
              >
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-surface-3 text-fg-muted">
                  <UsersIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-msg font-medium text-fg">
                    {room.name}
                  </span>
                  <span className="block truncate text-meta text-fg-subtle">
                    {room.description}
                  </span>
                </span>
                {active ? (
                  <CheckIcon className="h-4 w-4 flex-none text-accent-text" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
