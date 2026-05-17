import React from "react";
import { useAuth } from "../auth/AuthContext";
import ChatLayout from "../components/chat/ChatLayout";
import ChatPanelHeader from "../components/chat/ChatPanelHeader";
import ChatSidebarHeader from "../components/chat/ChatSidebarHeader";
import FriendsSidebar from "../components/chat/FriendsSidebar";
import MessageComposer from "../components/chat/MessageComposer";
import MessageList from "../components/chat/MessageList";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useDmChat } from "../hooks/useDmChat";
import { useFriends } from "../hooks/useFriends";
import { useMessageComposer } from "../hooks/useMessageComposer";
import { useSocket } from "../hooks/useSocket";
import { displayHandle } from "../lib/usernames";

export default function FriendsChat({ onSwitchTab }) {
  const { user } = useAuth();
  const { socketRef, connected } = useSocket();
  const friends = useFriends();

  const dmChat = useDmChat({
    socketRef,
    username: user?.username,
    selectedFriend: friends.selectedFriend,
  });

  const composer = useMessageComposer({
    onTypingChange: (isTyping) => dmChat.emitTyping(isTyping),
  });

  const listRef = useAutoScroll([
    friends.selectedFriend?.username,
    dmChat.messages.length,
  ]);

  const friend = friends.selectedFriend;

  function handleSend() {
    if (!friend) return;
    const payload = composer.buildPayload();
    if (!payload.hasContent) return;
    dmChat.sendMessage(payload);
    composer.clearComposer();
  }

  return (
    <ChatLayout
      sidebar={
        <>
          <ChatSidebarHeader
            username={user?.username}
            switchLabel="Rooms"
            onSwitch={() => onSwitchTab?.("rooms")}
          />
          <FriendsSidebar
            loading={friends.loading}
            error={friends.error}
            submitting={friends.submitting}
            state={friends.state}
            addUsername={friends.addUsername}
            setAddUsername={friends.setAddUsername}
            canRequest={friends.canRequest}
            onRequest={friends.requestFriend}
            onAccept={friends.accept}
            onDecline={friends.decline}
            onRemove={(username) =>
              friends.remove(username, (u) => dmChat.clearThread(u))
            }
            selectedFriend={friend}
            onSelectFriend={friends.setSelectedFriend}
          />
        </>
      }
    >
      <ChatPanelHeader
        title={friend ? displayHandle(friend.username) : "Select a friend"}
        subtitle={
          friend ? "Direct messages" : "Pick a friend to start chatting."
        }
        connected={connected}
        typingUser={dmChat.typingUser}
      />

      <MessageList
        listRef={listRef}
        messages={dmChat.messages}
        myUsername={user?.username}
        peerUsername={friend?.username}
        requirePeer
        empty={{
          title: "No messages yet",
          description: friend ? `Say hi to ${displayHandle(friend.username)}.` : undefined,
        }}
      />

      <MessageComposer
        composer={composer}
        onDraftChange={composer.updateDraft}
        onSend={handleSend}
        disabled={!friend}
        placeholder={
          friend
            ? `Message ${displayHandle(friend.username)}`
            : "Select a friend to start chatting"
        }
        showVoiceWhenEmpty
      />
    </ChatLayout>
  );
}
