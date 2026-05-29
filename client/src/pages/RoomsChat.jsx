import React from "react";
import { useAuth } from "../auth/AuthContext";
import ChatLayout from "../components/chat/ChatLayout";
import ChatPanelHeader from "../components/chat/ChatPanelHeader";
import ChatSidebarHeader from "../components/chat/ChatSidebarHeader";
import MessageComposer from "../components/chat/MessageComposer";
import MessageList from "../components/chat/MessageList";
import RoomsSidebar from "../components/chat/RoomsSidebar";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useMessageComposer } from "../hooks/useMessageComposer";
import { useRoomChat } from "../hooks/useRoomChat";
import { useSocket } from "../hooks/useSocket";
export default function RoomsChat({ onSwitchTab }) {
  const { user } = useAuth();
  const { socketRef, connected } = useSocket();

  const roomChat = useRoomChat({ socketRef, username: user?.username });
  const composer = useMessageComposer({
    onTypingChange: (isTyping) => roomChat.emitTyping(isTyping),
  });

  const listRef = useAutoScroll([roomChat.activeRoomId, roomChat.messages.length]);

  function handleSend() {
    const payload = composer.buildPayload();
    if (!payload.hasContent) return;
    roomChat.sendMessage(payload);
    composer.clearComposer();
  }

  return (
    <ChatLayout
      sidebar={
        <>
          <ChatSidebarHeader
            username={user?.username}
            switchLabel="Friends"
            switchPrimary
            onSwitch={() => onSwitchTab?.("friends")}
          />
          <RoomsSidebar
            rooms={roomChat.rooms}
            activeRoomId={roomChat.activeRoomId}
            onSelectRoom={roomChat.setActiveRoomId}
          />
        </>
      }
    >
      <ChatPanelHeader
        title={roomChat.activeRoom?.name}
        subtitle={roomChat.activeRoom?.description}
        avatarName={roomChat.activeRoom?.name}
        connected={connected}
        typingUser={roomChat.typingUser}
      />

      <MessageList
        listRef={listRef}
        messages={roomChat.messages}
        myUsername={user?.username}
        empty={{
          title: "No messages yet",
          description: `Start chatting in #${roomChat.activeRoom?.id}.`,
        }}
      />

      <MessageComposer
        composer={composer}
        onDraftChange={composer.updateDraft}
        onSend={handleSend}
        placeholder={`Message #${roomChat.activeRoom?.id}`}
        showShiftHint={false}
      />
    </ChatLayout>
  );
}
