import React from "react";
import { EMOJI_PICKER } from "../../lib/constants";

export default function MessageComposer({
  onDraftChange,
  onSend,
  disabled,
  placeholder,
  composer,
  showShiftHint = true,
  showVoiceWhenEmpty = false,
}) {
  const {
    draft,
    emojiOpen,
    setEmojiOpen,
    uploading,
    pendingAttachment,
    setPendingAttachment,
    fileInputRef,
    pdfInputRef,
    insertEmoji,
    attachFile,
    canSend,
  } = composer;

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/30 p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-3 py-2">
          {pendingAttachment ? (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-200">
                  {pendingAttachment.originalName || "Attachment"}
                </div>
                <div className="text-[11px] text-slate-500">{pendingAttachment.mime}</div>
              </div>
              <button
                type="button"
                onClick={() => setPendingAttachment(null)}
                className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60"
              >
                Remove
              </button>
            </div>
          ) : null}

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-slate-200 hover:bg-slate-950/60"
              title="Emoji"
              aria-label="Emoji"
            >
              🙂
            </button>

            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              rows={1}
              disabled={disabled}
              placeholder={placeholder}
              className="max-h-36 w-full resize-none bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-70"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || disabled}
              className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-slate-200 hover:bg-slate-950/60 disabled:cursor-not-allowed disabled:opacity-60"
              title="Photo / Video"
              aria-label="Photo / Video"
            >
              📎
            </button>

            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={uploading || disabled}
              className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-slate-200 hover:bg-slate-950/60 disabled:cursor-not-allowed disabled:opacity-60"
              title="PDF"
              aria-label="PDF"
            >
              📄
            </button>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            {showShiftHint ? <span>Shift+Enter for new line</span> : <span />}
            <span>{draft.trim().length ? `${draft.trim().length} chars` : ""}</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) await attachFile(file);
          }}
        />

        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) await attachFile(file);
          }}
        />

        <SendButton
          onClick={onSend}
          disabled={disabled || !canSend}
          showVoice={showVoiceWhenEmpty && !canSend}
        />
      </div>

      {emojiOpen ? (
        <div className="mt-3 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-300">Emojis</div>
            <button
              type="button"
              onClick={() => setEmojiOpen(false)}
              className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PICKER.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => insertEmoji(em)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-lg hover:bg-slate-950/60"
                aria-label={`emoji ${em}`}
                title={em}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SendButton({ onClick, disabled, showVoice }) {
  const sendIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M2.01 21l20.99-9L2.01 3 2 10l15 2-15 2 .01 7z" />
    </svg>
  );
  const micIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v4" />
      <path d="M8 23h8" />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={showVoice ? "Voice message" : "Send message"}
      title={showVoice ? "Voice" : "Send"}
      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-800/70 disabled:text-slate-500"
    >
      {showVoice ? micIcon : sendIcon}
    </button>
  );
}
