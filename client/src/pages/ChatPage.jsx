import React, { useState } from "react";
import FriendsChat from "./FriendsChat";
import RoomsChat from "./RoomsChat";

export default function ChatPage() {
  const [tab, setTab] = useState("rooms"); // "rooms" | "friends"

  return tab === "friends" ? (
    <FriendsChat onSwitchTab={setTab} />
  ) : (
    <RoomsChat onSwitchTab={setTab} />
  );
}
