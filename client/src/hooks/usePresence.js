import { useEffect, useMemo, useState } from "react";

/**
 * Which of your friends are online, keyed by username.
 *
 * The dot this feeds is real: the server counts open sockets per person, so it
 * only goes out when their last tab closes. Everything here is a mirror of what
 * the server has told us — we never guess.
 *
 * @returns {Record<string, {online: boolean, lastSeenAt: string|null}>}
 */
export function usePresence({ socketRef, friends }) {
  const [presence, setPresence] = useState({});

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Full replacement: the snapshot is the whole friends list, so anyone
    // missing from it is no longer a friend.
    const onSnapshot = ({ users } = {}) => {
      const next = {};
      for (const user of users || []) {
        if (!user?.username) continue;
        next[user.username] = {
          online: Boolean(user.online),
          lastSeenAt: user.lastSeenAt || null,
        };
      }
      setPresence(next);
    };

    const onPresence = (user) => {
      if (!user?.username) return;
      setPresence((prev) => ({
        ...prev,
        [user.username]: {
          online: Boolean(user.online),
          lastSeenAt: user.lastSeenAt || null,
        },
      }));
    };

    // Our own connection dropped, so we no longer know anything about anyone.
    // Showing a stale green dot would be worse than showing none.
    const onDisconnect = () => setPresence({});

    socket.on("presenceSnapshot", onSnapshot);
    socket.on("presence", onPresence);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("presenceSnapshot", onSnapshot);
      socket.off("presence", onPresence);
      socket.off("disconnect", onDisconnect);
    };
  }, [socketRef]);

  // Accepting or removing a friend changes who we care about. Ask for a fresh
  // snapshot instead of waiting for that person's next connect.
  const friendKey = useMemo(
    () =>
      (friends || [])
        .map((f) => f.username)
        .sort()
        .join(","),
    [friends],
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !friendKey) return;
    socket.emit("presenceSync");
  }, [socketRef, friendKey]);

  // "Last seen 5 minutes ago" would otherwise freeze at whatever it said the
  // moment they left. One re-render a minute keeps it counting.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  return presence;
}
