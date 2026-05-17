import React, { useState } from "react";
import FriendsChat from "./FriendsChat";
import RoomsChat from "./RoomsChat";

const TABS = {
  rooms: RoomsChat,
  friends: FriendsChat,
};

/** Main chat screen: switch between public rooms and friend DMs. */
export default function ChatPage() {
  const [tab, setTab] = useState("rooms");
  const View = TABS[tab] ?? RoomsChat;

  return <View onSwitchTab={setTab} />;
}
