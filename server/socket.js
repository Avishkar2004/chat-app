import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import {
  getDmHistory,
  getRoomHistory,
  markDmRead,
  saveDmMessage,
  saveRoomMessage,
} from "./services/messages.js";
import { loadFriendPair, parseCookies } from "./socket/helpers.js";

function attachmentFromPayload(attachment) {
  const url = attachment?.url ? String(attachment.url).trim() : "";
  const mime = attachment?.mime ? String(attachment.mime).trim() : "";
  const hasAttachment = Boolean(url && mime);
  if (hasAttachment && !url.startsWith("/uploads/")) return null;
  return hasAttachment ? { url, mime } : null;
}

/** Socket.IO for public rooms and friend DMs (messages stored in MongoDB). */
export function initSocket(httpServer, { corsOrigin }) {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  });

  io.on("connection", (socket) => {
    socket.data.userId = null;
    socket.data.username = null;
    socket.data.roomId = null;
    socket.data.dmRoomId = null;

    try {
      const cookies = parseCookies(socket.handshake.headers?.cookie);
      const token = cookies.token;
      const secret = process.env.JWT_SECRET;
      if (token && secret) {
        const payload = jwt.verify(token, secret);
        socket.data.userId = payload.sub;
      }
    } catch {
      // unauthenticated socket
    }

    socket.on("joinRoom", async ({ roomId } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      if (!safeRoomId || !socket.data.userId) return;

      const me = await User.findById(socket.data.userId).select("_id username");
      if (!me) return;

      socket.data.username = me.username;
      socket.data.roomId = safeRoomId;
      socket.join(safeRoomId);

      const history = await getRoomHistory(safeRoomId);
      socket.emit("roomHistory", { roomId: safeRoomId, messages: history });

      io.to(safeRoomId).emit("userJoined", { roomId: safeRoomId, username: me.username });
    });

    socket.on("sendMessage", async ({ roomId, body, attachment } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      const safeBody = String(body || "").trim();
      const safeAttachment = attachmentFromPayload(attachment);
      if (!safeRoomId || (!safeBody && !safeAttachment)) return;
      if (safeBody.length > 2000) return;
      if (!socket.data.userId) return;

      try {
        const message = await saveRoomMessage({
          roomId: safeRoomId,
          username: socket.data.username || "Anonymous",
          body: safeBody,
          attachment: safeAttachment,
        });
        io.to(safeRoomId).emit("message", message);
      } catch {
        // ignore
      }
    });

    socket.on("typing", ({ roomId, isTyping } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      if (!safeRoomId || !socket.data.username) return;
      socket.to(safeRoomId).emit("typing", {
        roomId: safeRoomId,
        username: socket.data.username,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("joinDm", async ({ friendUsername } = {}) => {
      try {
        const pair = await loadFriendPair(socket.data.userId, friendUsername);
        if (!pair) return;

        socket.data.username = pair.me.username;
        socket.data.dmRoomId = pair.room;
        socket.join(pair.room);

        const history = await getDmHistory(pair.room);
        socket.emit("dmHistory", {
          friendUsername: pair.friend.username,
          messages: history,
        });

        const read = await markDmRead(pair.room, pair.me.username);
        if (read) {
          io.to(pair.room).emit("dmReadReceipt", {
            readBy: pair.me.username,
            messageIds: read.messageIds,
            readAt: read.readAt,
          });
        }

        io.to(pair.room).emit("dmUserJoined", {
          roomId: pair.room,
          username: pair.me.username,
        });
      } catch {
        // ignore
      }
    });

    socket.on("dmMessage", async ({ friendUsername, body, attachment } = {}) => {
      try {
        const safeBody = String(body || "").trim();
        const safeAttachment = attachmentFromPayload(attachment);
        if (!safeBody && !safeAttachment) return;
        if (safeBody.length > 2000) return;

        const pair = await loadFriendPair(socket.data.userId, friendUsername);
        if (!pair) return;

        const message = await saveDmMessage({
          roomId: pair.room,
          username: pair.me.username,
          to: pair.friend.username,
          body: safeBody,
          attachment: safeAttachment,
        });
        io.to(pair.room).emit("dmMessage", message);
      } catch {
        // ignore
      }
    });

    socket.on("dmMarkRead", async ({ friendUsername } = {}) => {
      try {
        const pair = await loadFriendPair(socket.data.userId, friendUsername);
        if (!pair) return;

        const read = await markDmRead(pair.room, pair.me.username);
        if (!read) return;

        io.to(pair.room).emit("dmReadReceipt", {
          readBy: pair.me.username,
          messageIds: read.messageIds,
          readAt: read.readAt,
        });
      } catch {
        // ignore
      }
    });

    socket.on("dmTyping", async ({ friendUsername, isTyping } = {}) => {
      try {
        const pair = await loadFriendPair(socket.data.userId, friendUsername);
        if (!pair) return;
        socket.to(pair.room).emit("dmTyping", {
          roomId: pair.room,
          username: pair.me.username,
          isTyping: Boolean(isTyping),
        });
      } catch {
        // ignore
      }
    });

    socket.on("disconnect", () => {
      const { roomId, username } = socket.data;
      if (roomId && username) {
        io.to(roomId).emit("userLeft", { roomId, username });
      }
    });
  });

  return io;
}
