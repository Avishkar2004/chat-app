import { useCallback, useEffect, useState } from "react";
import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriendsState,
  removeFriend,
  sendFriendRequest,
} from "../services/friendsApi";
import { normalizeHandle } from "../lib/usernames";

/**
 * Friends list, requests, and API actions.
 * Keeps a selected friend in sync when the friends list changes.
 */
export function useFriends() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [state, setState] = useState({ friends: [], incoming: [], outgoing: [] });
  const [selectedFriend, setSelectedFriend] = useState(null);

  const refresh = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const next = await fetchFriendsState();
      setState(next);
      setSelectedFriend((current) => {
        if (current && next.friends.some((f) => f.username === current.username)) {
          return current;
        }
        return next.friends[0] || null;
      });
    } catch (e) {
      setError(e.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function runAction(action) {
    setSubmitting(true);
    setError("");
    try {
      await action();
      await refresh();
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  function requestFriend() {
    const username = normalizeHandle(addUsername);
    if (username.length < 3) return;
    return runAction(async () => {
      await sendFriendRequest(username);
      setAddUsername("");
    });
  }

  function accept(username) {
    return runAction(() => acceptFriendRequest(username));
  }

  function decline(username) {
    return runAction(() => declineFriendRequest(username));
  }

  function remove(username, onRemoved) {
    return runAction(async () => {
      await removeFriend(username);
      onRemoved?.(username);
    });
  }

  return {
    loading,
    error,
    submitting,
    state,
    addUsername,
    setAddUsername,
    selectedFriend,
    setSelectedFriend,
    refresh,
    requestFriend,
    accept,
    decline,
    remove,
    canRequest: normalizeHandle(addUsername).length >= 3,
  };
}
