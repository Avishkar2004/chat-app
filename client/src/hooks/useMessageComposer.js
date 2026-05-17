import { useRef, useState } from "react";
import { uploadFile } from "../services/uploadsApi";

/** Draft text, emoji picker, and optional file attachment before send. */
export function useMessageComposer({ onTypingChange } = {}) {
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  function updateDraft(value) {
    setDraft(value);
    const isTyping = String(value || "").trim().length > 0;
    onTypingChange?.(isTyping);
  }

  function insertEmoji(emoji) {
    if (!emoji) return;
    setDraft((value) => {
      const next = `${value}${emoji}`;
      onTypingChange?.(next.trim().length > 0);
      return next;
    });
  }

  async function attachFile(file) {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadFile(file);
      setPendingAttachment(data);
    } finally {
      setUploading(false);
    }
  }

  function clearComposer() {
    setDraft("");
    setPendingAttachment(null);
    onTypingChange?.(false);
  }

  function buildPayload() {
    const body = draft.trim();
    const attachment = pendingAttachment
      ? { url: pendingAttachment.url, mime: pendingAttachment.mime }
      : null;
    return { body, attachment, hasContent: Boolean(body || attachment) };
  }

  return {
    draft,
    emojiOpen,
    setEmojiOpen,
    uploading,
    pendingAttachment,
    setPendingAttachment,
    fileInputRef,
    pdfInputRef,
    updateDraft,
    insertEmoji,
    attachFile,
    clearComposer,
    buildPayload,
    canSend: Boolean(draft.trim() || pendingAttachment),
  };
}
