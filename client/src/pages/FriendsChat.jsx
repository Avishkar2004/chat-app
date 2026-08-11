import React from "react";
import ChatPanelHeader from "../components/chat/ChatPanelHeader";
import EmptyState from "../components/chat/EmptyState";
import MessageComposer from "../components/chat/MessageComposer";
import MessageList from "../components/chat/MessageList";
import { ChatIcon } from "../components/ui/icons";
import { displayHandle } from "../lib/usernames";

/**
 * The conversation column for a one-to-one chat: who you're talking to, the
 * messages, and the box to reply in. All state lives in ChatPage — this file
 * only decides how a direct message looks.
 */
export default function FriendsChat({
  friend,
  myUsername,
  connected,
  messages,
  typingUser,
  composer,
  listRef,
  onSend,
  onBack,
}) {
  if (!friend) {
    return (
      <EmptyState
        tall
        icon={ChatIcon}
        title="No chat open"
        description="Pick someone from your chats on the left, or add a friend by username to start a new one."
      />
    );
  }

  const name = displayHandle(friend.username);

  return (
    <>
      <ChatPanelHeader
        title={name}
        subtitle="Private chat — only the two of you can see this"
        avatarName={friend.username}
        connected={connected}
        onBack={onBack}
      />

      <MessageList
        listRef={listRef}
        messages={messages}
        myUsername={myUsername}
        peerUsername={friend.username}
        variant="dm"
        showReadStatus
        typingUser={typingUser}
        empty={{
          title: `This is the start of your chat with ${name}`,
          description: "Say hello — your message will appear right here.",
        }}
      />

      <MessageComposer
        composer={composer}
        onDraftChange={composer.updateDraft}
        onSend={onSend}
        placeholder={`Message ${name}`}
      />
    </>
  );
}
