import React, { useState } from "react";
import Avatar from "../ui/Avatar";
import { CheckIcon, CloseIcon, InboxIcon, TrashIcon, UserPlusIcon } from "../ui/icons";
import { displayHandle } from "../../lib/usernames";

export default function FriendsSidebar({
  loading,
  error,
  notice,
  onDismissError,
  onDismissNotice,
  submitting,
  state,
  addUsername,
  setAddUsername,
  canRequest,
  onRequest,
  onAccept,
  onDecline,
  onCancel,
  onRemove,
  selectedFriend,
  onSelectFriend,
}) {
  // Which friend is pending a remove confirmation (two-step destructive action).
  const [confirmRemove, setConfirmRemove] = useState(null);

  const incoming = state.incoming || [];
  const outgoing = state.outgoing || [];
  const friends = state.friends || [];

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <UserPlusIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={addUsername}
            onChange={(e) => setAddUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !submitting) onRequest();
            }}
            placeholder="Add by username (e.g. @john)"
            aria-label="Add a friend by username"
            className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 py-2 pl-9 pr-3 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>
        <button
          type="button"
          onClick={onRequest}
          disabled={!canRequest || submitting}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>

      {error ? (
        <Banner tone="error" onDismiss={onDismissError}>
          {error}
        </Banner>
      ) : null}
      {notice ? (
        <Banner tone="success" onDismiss={onDismissNotice}>
          {notice}
        </Banner>
      ) : null}

      {loading ? (
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-xl border border-slate-800/60 bg-slate-950/30"
            />
          ))}
        </div>
      ) : (
        <>
          {incoming.length ? (
            <section className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <InboxIcon className="h-3.5 w-3.5 text-indigo-300" />
                Requests ({incoming.length})
              </h3>
              <ul className="mt-2 space-y-1.5">
                {incoming.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar name={u.username} size="xs" />
                      <span className="truncate text-xs text-slate-200">
                        {displayHandle(u.username)}
                      </span>
                    </span>
                    <div className="flex flex-none items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onAccept(u.username)}
                        disabled={submitting}
                        aria-label={`Accept ${u.username}`}
                        title="Accept"
                        className="grid h-7 w-7 place-items-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:opacity-60"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecline(u.username)}
                        disabled={submitting}
                        aria-label={`Decline ${u.username}`}
                        title="Decline"
                        className="grid h-7 w-7 place-items-center rounded-md border border-slate-800/80 bg-slate-950/30 text-slate-300 transition hover:bg-slate-950/60 disabled:opacity-60"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {outgoing.length ? (
            <section>
              <h3 className="text-xs font-medium text-slate-400">
                Pending ({outgoing.length})
              </h3>
              <ul className="mt-2 space-y-1.5">
                {outgoing.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-950/30 px-2.5 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar name={u.username} size="xs" />
                      <span className="truncate text-xs text-slate-300">
                        {displayHandle(u.username)}
                      </span>
                      <span className="flex-none rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-500/20">
                        Sent
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onCancel(u.username)}
                      disabled={submitting}
                      className="flex-none rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-slate-950/60 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h3 className="text-xs font-medium text-slate-400">
              Friends ({friends.length})
            </h3>
            <ul className="mt-2 space-y-1.5">
              {friends.length ? (
                friends.map((f) => {
                  const active = selectedFriend?.username === f.username;
                  const confirming = confirmRemove === f.username;
                  return (
                    <li key={f.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectFriend(f)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectFriend(f);
                          }
                        }}
                        className={[
                          "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                          active
                            ? "border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20"
                            : "border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60",
                        ].join(" ")}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Avatar name={f.username} size="sm" />
                          <span className="truncate text-xs font-medium text-slate-100">
                            {displayHandle(f.username)}
                          </span>
                        </span>

                        {confirming ? (
                          <span className="flex flex-none items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove(f.username);
                                setConfirmRemove(null);
                              }}
                              disabled={submitting}
                              className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
                            >
                              Remove
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmRemove(null);
                              }}
                              className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-slate-950/60"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setConfirmRemove(f.username);
                            }}
                            disabled={submitting}
                            aria-label={`Remove ${f.username}`}
                            title="Remove friend"
                            className="grid h-7 w-7 flex-none place-items-center rounded-md border border-slate-800/80 bg-slate-950/30 text-slate-400 opacity-0 transition hover:bg-rose-950/40 hover:text-rose-200 focus:opacity-100 group-hover:opacity-100 disabled:opacity-60"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="rounded-xl border border-dashed border-slate-800/80 px-3 py-4 text-center text-xs text-slate-500">
                  No friends yet. Add someone above.
                </li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Banner({ tone, onDismiss, children }) {
  const styles =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-100"
      : "border-rose-500/30 bg-rose-950/40 text-rose-100";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${styles}`}
    >
      <span className="min-w-0">{children}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid h-5 w-5 flex-none place-items-center rounded transition hover:bg-white/10"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
