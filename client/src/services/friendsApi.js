import { api } from "../api";

export async function fetchFriendsState() {
  const data = await api("/api/friends/state");
  return {
    friends: data.friends || [],
    incoming: data.incoming || [],
    outgoing: data.outgoing || [],
  };
}

export function sendFriendRequest(username) {
  return api("/api/friends/request", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function acceptFriendRequest(username) {
  return api("/api/friends/accept", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function declineFriendRequest(username) {
  return api("/api/friends/decline", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function cancelFriendRequest(username) {
  return api("/api/friends/cancel", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function removeFriend(username) {
  return api("/api/friends/remove", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}
