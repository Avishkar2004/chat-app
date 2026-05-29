import React from "react";
import { EMOJI_PICKER } from "../../lib/constants";
import {
  CloseIcon,
  FileIcon,
  MicIcon,
  PaperclipIcon,
  SendIcon,
  SmileIcon,
} from "../ui/icons";

const toolBtnClass =
  "grid h-10 w-10 flex-none place-items-center rounded-xl border border-slate-800/80 bg-slate-950/30 text-slate-300 transition hover:bg-slate-950/60 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-60";

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
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/20">
                  <FileIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-slate-200">
                    {pendingAttachment.originalName || "Attachment"}
                  </div>
                  <div className="text-[11px] text-slate-500">{pendingAttachment.mime}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingAttachment(null)}
                aria-label="Remove attachment"
                className="grid h-7 w-7 flex-none place-items-center rounded-md border border-slate-800/80 bg-slate-950/30 text-slate-300 transition hover:bg-rose-950/40 hover:text-rose-200"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              className={[toolBtnClass, emojiOpen ? "text-indigo-300 ring-1 ring-indigo-500/30" : ""].join(" ")}
              title="Emoji"
              aria-label="Emoji"
            >
              <SmileIcon />
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
              className={toolBtnClass}
              title="Photo / Video"
              aria-label="Photo / Video"
            >
              <PaperclipIcon />
            </button>

            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={uploading || disabled}
              className={toolBtnClass}
              title="PDF"
              aria-label="PDF"
            >
              <FileIcon />
            </button>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            {uploading ? (
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400/40 border-t-indigo-300" />
                Uploading…
              </span>
            ) : showShiftHint ? (
              <span>Shift+Enter for new line</span>
            ) : (
              <span />
            )}
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
              aria-label="Close emoji picker"
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-800/80 bg-slate-950/30 text-slate-300 transition hover:bg-slate-950/60"
            >
              <CloseIcon className="h-4 w-4" />
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={showVoice ? "Voice message" : "Send message"}
      title={showVoice ? "Voice" : "Send"}
      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-400 hover:to-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:from-slate-800/70 disabled:to-slate-800/70 disabled:text-slate-500 disabled:shadow-none"
    >
      {showVoice ? <MicIcon className="h-5 w-5" /> : <SendIcon className="h-5 w-5" />}
    </button>
  );
}
