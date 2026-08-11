import React from "react";
import ChatPanelHeader from "../components/chat/ChatPanelHeader";
import MessageComposer from "../components/chat/MessageComposer";
import MessageList from "../components/chat/MessageList";

/**
 * The conversation column for a group chat. Messages show the sender's name and
 * picture, because more than two people can be talking. All state lives in
 * ChatPage — this file only decides how a group chat looks.
 */
export default function RoomsChat({
  room,
  myUsername,
  connected,
  messages,
  typingUser,
  composer,
  listRef,
  onSend,
  onBack,
}) {
  return (
    <>
      <ChatPanelHeader
        title={room?.name}
        subtitle={`Group chat · ${room?.description || "Open to everyone"}`}
        isGroup
        connected={connected}
        onBack={onBack}
      />

      <MessageList
        listRef={listRef}
        messages={messages}
        myUsername={myUsername}
        variant="group"
        typingUser={typingUser}
        empty={{
          title: `No messages in ${room?.name || "this group"} yet`,
          description: "Be the first to say something — everyone here will see it.",
        }}
      />

      <MessageComposer
        composer={composer}
        onDraftChange={composer.updateDraft}
        onSend={onSend}
        placeholder={`Message ${room?.name || "this group"}`}
      />
    </>
  );
}
