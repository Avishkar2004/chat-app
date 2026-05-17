import { useEffect, useMemo, useRef, useState } from "react";
import { CHAT_ROOMS } from "../lib/constants";
import { appendMessage } from "../lib/messages";

function toUiMessage(raw, myUsername) {
  return {
    id: raw.id,
    roomId: raw.roomId,
    author: raw.username,
    body: raw.body || "",
    attachment: raw.attachment || null,
    ts: raw.ts,
    mine: raw.username === myUsername,
  };
}

/** Room list, messages, typing, and Socket.IO events for public channels. */
export function useRoomChat({ socketRef, username }) {
  const [activeRoomId, setActiveRoomId] = useState(CHAT_ROOMS[0]?.id ?? "general");
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [typingUser, setTypingUser] = useState("");

  const activeRoomIdRef = useRef(activeRoomId);
  const usernameRef = useRef(username);
  const typingTimeoutRef = useRef(null);

  const activeRoom = CHAT_ROOMS.find((r) => r.id === activeRoomId) ?? CHAT_ROOMS[0];
  const messages = useMemo(
    () => messagesByRoom[activeRoomId] || [],
    [messagesByRoom, activeRoomId],
  );

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onRoomHistory = ({ roomId, messages }) => {
      if (!roomId || roomId !== activeRoomIdRef.current) return;
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: (messages || []).map((m) => toUiMessage(m, usernameRef.current)),
      }));
    };

    const onMessage = (message) => {
      if (!message || message.roomId !== activeRoomIdRef.current) return;
      setMessagesByRoom((prev) => {
        const list = prev[message.roomId] || [];
        const next = appendMessage(list, toUiMessage(message, usernameRef.current));
        return { ...prev, [message.roomId]: next };
      });
    };

    const onTyping = (payload) => {
      if (!payload || payload.roomId !== activeRoomIdRef.current) return;
      if (payload.username === usernameRef.current) return;
      setTypingUser(payload.isTyping ? payload.username : "");
      if (payload.isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 1200);
      }
    };

    const onDisconnect = () => setTypingUser("");

    socket.on("roomHistory", onRoomHistory);
    socket.on("message", onMessage);
    socket.on("typing", onTyping);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("roomHistory", onRoomHistory);
      socket.off("message", onMessage);
      socket.off("typing", onTyping);
      socket.off("disconnect", onDisconnect);
    };
  }, [socketRef]);

  function joinActiveRoom() {
    const socket = socketRef.current;
    const roomId = String(activeRoomIdRef.current || "").trim();
    if (!socket?.connected || !roomId) return;
    setTypingUser("");
    socket.emit("joinRoom", { roomId });
  }

  useEffect(() => {
    joinActiveRoom();
  }, [activeRoomId, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.on("connect", joinActiveRoom);
    return () => socket.off("connect", joinActiveRoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef]);

  function emitTyping(isTyping) {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("typing", { roomId: activeRoomIdRef.current, isTyping });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { roomId: activeRoomIdRef.current, isTyping: false });
      }, 900);
    }
  }

  function sendMessage({ body, attachment }) {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("sendMessage", { roomId: activeRoomId, body, attachment });
    socket.emit("typing", { roomId: activeRoomId, isTyping: false });
  }

  return {
    rooms: CHAT_ROOMS,
    activeRoomId,
    setActiveRoomId,
    activeRoom,
    messages,
    typingUser,
    emitTyping,
    sendMessage,
  };
}
