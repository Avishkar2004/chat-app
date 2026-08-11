# Chat App Roadmap

Current state: auth (JWT cookie), friends system, public rooms, friend DMs, uploads
(image/video/pdf), typing indicators, read receipts, light/dark theme.

Five gaps, ranked by value.

## 1. Real online presence

**Status:** not started · **Estimate:** ~45 min

The green dot is decorative. `online` is hardcoded `true` in
[`client/src/components/chat/ChatSidebarHeader.jsx:13`](../client/src/components/chat/ChatSidebarHeader.jsx#L13),
and the dot itself already exists in
[`client/src/components/ui/Avatar.jsx:43`](../client/src/components/ui/Avatar.jsx#L43).
The server tracks no presence at all.

- Keep a `Map<userId, socketCount>` in [`server/socket.js`](../server/socket.js)
  (count, not boolean — one user can have several tabs open).
- Emit `presence` on connect and disconnect to that user's friends.
- Add `lastSeenAt` to [`server/models/User.js`](../server/models/User.js) so the
  header can show "last seen 5m ago" when offline.

## 2. Unread badges per friend

**Status:** not started · **Estimate:** ~40 min

Nothing counts unread messages. `readAt` is already stored on every message, so
this is one aggregate query — no schema change.

- Count messages where `kind: "dm"`, `to: <me>`, `readAt: null`, grouped by sender.
- Render a count pill in
  [`client/src/components/chat/FriendsSidebar.jsx`](../client/src/components/chat/FriendsSidebar.jsx).
- Clear it on `dmMarkRead`, which already exists in the socket layer.

## 3. Reply / edit / delete a message

**Status:** not started · **Estimate:** ~2 hours for all three

The WhatsApp look is in place but the interactions behind it are not.

- Add `replyTo`, `editedAt`, `deletedAt` to
  [`server/models/Message.js`](../server/models/Message.js).
- Add a hover menu to
  [`client/src/components/chat/MessageBubble.jsx`](../client/src/components/chat/MessageBubble.jsx).
- Deleted messages stay as rows and render as "This message was deleted" —
  simpler than removing them from every connected client's list.

## 4. Emoji reactions

**Status:** not started · **Estimate:** ~1 hour

- `reactions: [{ emoji, username }]` on the message schema.
- One socket event to toggle; re-sending the same emoji removes it.
- Render grouped counts under the bubble.

## 5. Notifications when the tab is inactive

**Status:** not started · **Estimate:** ~20 min

Cheapest win of the five.

- Gate on `document.hidden` so it never fires while the chat is visible.
- `Notification` API for the popup, short audio clip for the sound.
- Ask for permission on first send, not on page load.

## Known issues (not features)

- **No rate limiting** on the `sendMessage` and `dmMessage` socket handlers in
  [`server/socket.js`](../server/socket.js). A client can flood MongoDB with
  writes as fast as it can emit.
- **`/uploads` is served publicly** by
  [`server/index.js`](../server/index.js). Filenames are random, but anyone with
  a URL can read a private attachment while logged out.
