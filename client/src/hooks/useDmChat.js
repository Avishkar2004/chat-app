import { useEffect, useMemo, useRef, useState } from "react";
import { appendMessage } from "../lib/messages";

function toUiMessage(raw, myUsername) {
  const mine = raw.username === myUsername;
  const friendKey = mine ? raw.to : raw.username;
  return {
    ui: {
      id: raw.id,
      author: raw.username,
      body: raw.body || "",
      attachment: raw.attachment || null,
      ts: raw.ts,
      mine,
      read: Boolean(raw.readAt),
    },
    friendKey,
  };
}

/** DM threads, typing, and Socket.IO events for friend conversations. */
export function useDmChat({ socketRef, username, selectedFriend }) {
  const [threads, setThreads] = useState({});
  const [typingUser, setTypingUser] = useState("");

  const usernameRef = useRef(username);
  const selectedFriendRef = useRef(selectedFriend);

  const messages = useMemo(
    () => (selectedFriend?.username ? threads[selectedFriend.username] || [] : []),
    [threads, selectedFriend?.username],
  );

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onDmHistory = ({ friendUsername, messages }) => {
      const friend = selectedFriendRef.current;
      if (!friendUsername || !friend || friend.username !== friendUsername) return;
      setThreads((prev) => ({
        ...prev,
        [friendUsername]: (messages || []).map((m) => {
          const { ui } = toUiMessage(m, usernameRef.current);
          return ui;
        }),
      }));
      markRead();
    };

    const onDmMessage = (message) => {
      if (!message) return;
      const { ui, friendKey } = toUiMessage(message, usernameRef.current);
      setThreads((prev) => ({
        ...prev,
        [friendKey]: appendMessage(prev[friendKey] || [], ui),
      }));

      if (!ui.mine) {
        markRead();
      }
    };

    const onDmReadReceipt = ({ readBy, messageIds, readAt }) => {
      if (!readBy || !messageIds?.length) return;
      const ids = new Set(messageIds);
      setThreads((prev) => {
        const list = prev[readBy];
        if (!list?.length) return prev;
        return {
          ...prev,
          [readBy]: list.map((m) =>
            m.mine && ids.has(m.id) ? { ...m, read: true, readAt } : m,
          ),
        };
      });
    };

    const onDmTyping = (payload) => {
      if (!payload) return;
      if (payload.username === usernameRef.current) return;
      const friend = selectedFriendRef.current;
      if (!friend || payload.username !== friend.username) return;
      setTypingUser(payload.isTyping ? payload.username : "");
    };

    const onDisconnect = () => setTypingUser("");

    socket.on("dmHistory", onDmHistory);
    socket.on("dmMessage", onDmMessage);
    socket.on("dmReadReceipt", onDmReadReceipt);
    socket.on("dmTyping", onDmTyping);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("dmHistory", onDmHistory);
      socket.off("dmMessage", onDmMessage);
      socket.off("dmReadReceipt", onDmReadReceipt);
      socket.off("dmTyping", onDmTyping);
      socket.off("disconnect", onDisconnect);
    };
  }, [socketRef]);

  function markRead() {
    const socket = socketRef.current;
    const friend = selectedFriendRef.current;
    if (!socket?.connected || !friend?.username) return;
    socket.emit("dmMarkRead", { friendUsername: friend.username });
  }

  function joinActiveDm() {
    const socket = socketRef.current;
    const friend = selectedFriendRef.current;
    if (!socket?.connected || !friend?.username) return;
    setTypingUser("");
    socket.emit("joinDm", { friendUsername: friend.username });
  }

  useEffect(() => {
    joinActiveDm();
  }, [selectedFriend?.username, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.on("connect", joinActiveDm);
    return () => socket.off("connect", joinActiveDm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef]);

  function emitTyping(isTyping) {
    const friend = selectedFriendRef.current;
    const socket = socketRef.current;
    if (!socket?.connected || !friend?.username) return;
    socket.emit("dmTyping", { friendUsername: friend.username, isTyping });
  }

  function sendMessage({ body, attachment }) {
    const friend = selectedFriendRef.current;
    const socket = socketRef.current;
    if (!socket?.connected || !friend?.username) return;
    socket.emit("dmMessage", {
      friendUsername: friend.username,
      body,
      attachment,
    });
    socket.emit("dmTyping", { friendUsername: friend.username, isTyping: false });
  }

  function clearThread(friendUsername) {
    setThreads((prev) => {
      const next = { ...prev };
      delete next[friendUsername];
      return next;
    });
  }

  return {
    messages,
    typingUser,
    emitTyping,
    sendMessage,
    clearThread,
  };
}
