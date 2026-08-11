import React from "react";
import Avatar from "../ui/Avatar";
import ConnectionStatus from "./ConnectionStatus";
import { IconButton } from "../ui/Button";
import { ArrowLeftIcon, UsersIcon } from "../ui/icons";

/**
 * Who (or what) you are looking at. On a phone this is also the way back to
 * the chat list — the arrow on the left.
 */
export default function ChatPanelHeader({
  title,
  subtitle,
  avatarName,
  isGroup = false,
  connected,
  onBack,
}) {
  return (
    <header className="flex flex-none items-center gap-2 border-b border-line bg-surface px-2 py-2 sm:px-3">
      {onBack ? (
        <IconButton
          variant="ghost"
          label="Back to your chats"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </IconButton>
      ) : null}

      {isGroup ? (
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-surface-3 text-fg-muted">
          <UsersIcon className="h-5 w-5" />
        </span>
      ) : avatarName ? (
        <Avatar name={avatarName} size="md" />
      ) : null}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-msg font-semibold text-fg">{title}</h2>
        {subtitle ? (
          <p className="truncate text-meta text-fg-subtle">{subtitle}</p>
        ) : null}
      </div>

      <ConnectionStatus connected={connected} />
    </header>
  );
}
