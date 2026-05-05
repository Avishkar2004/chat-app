import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

function parseCookies(cookieHeader) {
  const header = String(cookieHeader || "");
  const out = {};
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

function dmRoomId(a, b) {
  const ids = [String(a), String(b)].sort();
  return `dm:${ids[0]}:${ids[1]}`;
}

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
    // We'll store the authenticated user + current room on the socket.
    socket.data.userId = null;
    socket.data.username = null;
    socket.data.roomId = null;
    socket.data.dmRoomId = null;

    // Authenticate user from the same JWT cookie you already use for HTTP.
    // This keeps the client beginner-friendly: no extra tokens to manage.
    try {
      const cookies = parseCookies(socket.handshake.headers?.cookie);
      const token = cookies.token;
      const secret = process.env.JWT_SECRET;
      if (token && secret) {
        const payload = jwt.verify(token, secret);
        socket.data.userId = payload.sub;
      }
    } catch {
      // ignore (user stays unauthenticated)
    }

    socket.on("joinRoom", async ({ roomId } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      if (!safeRoomId) return;

      // Resolve username from DB (requires auth cookie).
      if (!socket.data.userId) return;
      const me = await User.findById(socket.data.userId).select("_id username");
      if (!me) return;

      socket.data.username = me.username;
      socket.data.roomId = safeRoomId;
      socket.join(safeRoomId);

      // Notify others in the room (optional).
      io.to(safeRoomId).emit("userJoined", {
        roomId: safeRoomId,
        username: me.username,
      });

      console.log("[socket] joinRoom:", socket.id, {
        roomId: safeRoomId,
        username: me.username,
      });
    });

    socket.on("sendMessage", ({ roomId, body, attachment } = {}) => {
      const safeRoomId = String(roomId || "").trim();
      const safeBody = String(body || "").trim();
      const safeAttachmentUrl = attachment?.url ? String(attachment.url).trim() : "";
      const safeAttachmentMime = attachment?.mime ? String(attachment.mime).trim() : "";
      const hasAttachment = Boolean(safeAttachmentUrl && safeAttachmentMime);
      if (!safeRoomId || (!safeBody && !hasAttachment)) return;

      // Simple validation: keep payload size reasonable.
      if (safeBody.length > 2000) return;
      if (hasAttachment && !safeAttachmentUrl.startsWith("/uploads/")) return;

      const username = socket.data.username || "Anonymous";
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        roomId: safeRoomId,
        username,
        body: safeBody,
        attachment: hasAttachment ? { url: safeAttachmentUrl, mime: safeAttachmentMime } : null,
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

    /**
     * Friends DM
     * Client sends: { friendUsername }
     * Server verifies: they are friends (in MongoDB), then joins a stable DM room.
     */
    socket.on("joinDm", async ({ friendUsername } = {}) => {
      try {
        const safeFriend = String(friendUsername || "").trim().replace(/^@/, "");
        if (!safeFriend) return;
        if (!socket.data.userId) return;

        const [me, friend] = await Promise.all([
          User.findById(socket.data.userId).select("_id username friends"),
          User.findOne({ username: safeFriend }).select("_id username friends"),
        ]);
        if (!me || !friend) return;

        const areFriends =
          me.friends?.some((id) => String(id) === String(friend._id)) &&
          friend.friends?.some((id) => String(id) === String(me._id));
        if (!areFriends) return;

        socket.data.username = me.username;
        const room = dmRoomId(me._id, friend._id);
        socket.data.dmRoomId = room;
        socket.join(room);

        io.to(room).emit("dmUserJoined", {
          roomId: room,
          username: me.username,
        });
      } catch {
        // ignore
      }
    });

    socket.on("dmMessage", async ({ friendUsername, body, attachment } = {}) => {
      try {
        const safeFriend = String(friendUsername || "").trim().replace(/^@/, "");
        const safeBody = String(body || "").trim();
        const safeAttachmentUrl = attachment?.url ? String(attachment.url).trim() : "";
        const safeAttachmentMime = attachment?.mime ? String(attachment.mime).trim() : "";
        const hasAttachment = Boolean(safeAttachmentUrl && safeAttachmentMime);

        if (!safeFriend || (!safeBody && !hasAttachment)) return;
        if (safeBody.length > 2000) return;
        if (hasAttachment && !safeAttachmentUrl.startsWith("/uploads/")) return;
        if (!socket.data.userId) return;

        const [me, friend] = await Promise.all([
          User.findById(socket.data.userId).select("_id username friends"),
          User.findOne({ username: safeFriend }).select("_id username friends"),
        ]);
        if (!me || !friend) return;

        const areFriends =
          me.friends?.some((id) => String(id) === String(friend._id)) &&
          friend.friends?.some((id) => String(id) === String(me._id));
        if (!areFriends) return;

        const room = dmRoomId(me._id, friend._id);
        const message = {
          id: `dm_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          roomId: room,
          username: me.username,
          to: friend.username,
          body: safeBody,
          attachment: hasAttachment ? { url: safeAttachmentUrl, mime: safeAttachmentMime } : null,
          ts: Date.now(),
        };

        io.to(room).emit("dmMessage", message);
      } catch {
        // ignore
      }
    });

    socket.on("dmTyping", async ({ friendUsername, isTyping } = {}) => {
      try {
        const safeFriend = String(friendUsername || "").trim().replace(/^@/, "");
        if (!safeFriend) return;
        if (!socket.data.userId) return;

        const [me, friend] = await Promise.all([
          User.findById(socket.data.userId).select("_id username friends"),
          User.findOne({ username: safeFriend }).select("_id username friends"),
        ]);
        if (!me || !friend) return;

        const areFriends =
          me.friends?.some((id) => String(id) === String(friend._id)) &&
          friend.friends?.some((id) => String(id) === String(me._id));
        if (!areFriends) return;

        const room = dmRoomId(me._id, friend._id);
        socket.to(room).emit("dmTyping", {
          roomId: room,
          username: me.username,
          isTyping: Boolean(isTyping),
        });
      } catch {
        // ignore
      }
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

