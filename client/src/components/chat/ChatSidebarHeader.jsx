import React from "react";
import Avatar from "../ui/Avatar";
import ConnectionStatus from "./ConnectionStatus";
import { ChatIcon, UsersIcon } from "../ui/icons";
import { displayHandle } from "../../lib/usernames";

/**
 * Top of the chat list: who you are signed in as, whether you are connected,
 * and the two tabs that are the only navigation in the whole app.
 *
 * The tabs are spelled out in words — "Direct messages" and "Group chats" — so
 * nobody has to work out what a "room" or a "DM" is.
 */
export default function ChatSidebarHeader({
  username,
  connected,
  tab,
  onTabChange,
  requestCount = 0,
  groupCount = 0,
}) {
  return (
    <div className="flex-none border-b border-line bg-surface px-3 pb-3 pt-3">
      <div className="flex items-center gap-2.5">
        <Avatar name={username} size="md" online={connected} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-msg font-semibold text-fg">Your chats</h1>
          <p className="truncate text-meta text-fg-subtle">
            Signed in as {displayHandle(username)}
          </p>
        </div>
        <ConnectionStatus connected={connected} compact />
      </div>

      <div
        role="tablist"
        aria-label="Choose what to show"
        className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1"
      >
        <Tab
          id="tab-direct"
          panelId="panel-direct"
          selected={tab === "direct"}
          onSelect={() => onTabChange("direct")}
          icon={ChatIcon}
          label="Direct messages"
          count={requestCount}
          countLabel={`${requestCount} new friend request${requestCount === 1 ? "" : "s"}`}
        />
        <Tab
          id="tab-groups"
          panelId="panel-groups"
          selected={tab === "groups"}
          onSelect={() => onTabChange("groups")}
          icon={UsersIcon}
          label="Group chats"
          count={0}
          countLabel={`${groupCount} group chats`}
        />
      </div>
    </div>
  );
}

function Tab({
  id,
  panelId,
  selected,
  onSelect,
  icon: Icon,
  label,
  count,
  countLabel,
}) {
  return (
    <button
      type="button"
      id={id}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      onClick={onSelect}
      className={[
        "relative flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-label font-medium transition",
        selected
          ? "border border-line bg-surface text-fg"
          : "border border-transparent text-fg-muted hover:text-fg",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 flex-none" />
      <span className="truncate">{label}</span>
      {count > 0 ? (
        <span
          className="ml-0.5 grid h-5 min-w-[1.25rem] flex-none place-items-center rounded-full bg-accent px-1 text-meta font-semibold text-accent-fg"
          aria-label={countLabel}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
