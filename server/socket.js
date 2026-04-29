import { Server as SocketIOServer } from "socket.io";

/**
 * Initialize Socket.IO on top of an existing HTTP server.
 *
 * Beginner-friendly notes:
 * - We keep message data in-memory (no DB persistence) to stay simple.
 * - Client sends `joinRoom` + `sendMessage`.
 * - Server broadcasts `message` and `typing` events to everyone in the room.
 */
export function initSocket(httpServer, { corsOrigin }) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("[socket] connected:", socket.id);
    // We'll store user + room on the socket once the client joins.
    socket.data.username = null;
    socket.data.roomId = null;

    socket.on("joinRoom", ({ roomId, username } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      const safeUsername = String(username || "").trim();
      if (!safeRoomId || !safeUsername) return;

      socket.data.username = safeUsername;
      socket.data.roomId = safeRoomId;
      socket.join(safeRoomId);

      // Notify others in the room (optional).
      io.to(safeRoomId).emit("userJoined", {
        roomId: safeRoomId,
        username: safeUsername,
      });

      console.log("[socket] joinRoom:", socket.id, {
        roomId: safeRoomId,
        username: safeUsername,
      });
    });

    socket.on("sendMessage", ({ roomId, body } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      const safeBody = String(body || "").trim();
      if (!safeRoomId || !safeBody) return;

      // Simple validation: keep payload size reasonable.
      if (safeBody.length > 2000) return;

      const username = socket.data.username || "Anonymous";
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        roomId: safeRoomId,
        username,
        body: safeBody,
        ts: Date.now(), // ms timestamp (works with Date constructor on frontend)
      };

      io.to(safeRoomId).emit("message", message);
    });

    socket.on("typing", ({ roomId, isTyping } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      if (!safeRoomId) return;
      if (!socket.data.username) return;

      socket.to(safeRoomId).emit("typing", {
        roomId: safeRoomId,
        username: socket.data.username,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      const username = socket.data.username;
      if (roomId && username) {
        io.to(roomId).emit("userLeft", { roomId, username });
      }
      console.log("[socket] disconnected:", socket.id, { roomId, username });
    });
  });

  return io;
}

