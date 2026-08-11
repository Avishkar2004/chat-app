import React from "react";

/**
 * The chat frame.
 *
 * Phone (under 768px): one thing at a time. The chat list fills the screen;
 * opening a chat slides the conversation in over it, and the header's back
 * arrow slides it away again.
 *
 * Tablet and up (`md:`): both columns side by side, list on the left.
 */
export default function ChatLayout({ sidebar, conversation, showConversation }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-6xl overflow-hidden md:gap-3 md:p-3">
      <aside
        aria-label="Your chats"
        className={[
          "min-w-0 flex-col overflow-hidden border-line bg-surface md:flex md:w-[20rem] md:flex-none md:rounded-xl md:border",
          showConversation ? "hidden" : "flex w-full",
        ].join(" ")}
      >
        {sidebar}
      </aside>

      <section
        aria-label="Conversation"
        className={[
          "min-w-0 flex-col overflow-hidden border-line bg-surface md:flex md:flex-1 md:rounded-xl md:border",
          showConversation ? "flex w-full animate-slide-in md:animate-none" : "hidden",
        ].join(" ")}
      >
        {conversation}
      </section>
    </div>
  );
}
