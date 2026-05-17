import React from "react";
import { initials } from "../../lib/format";
import { displayHandle } from "../../lib/usernames";

export default function FriendsSidebar({
  loading,
  error,
  submitting,
  state,
  addUsername,
  setAddUsername,
  canRequest,
  onRequest,
  onAccept,
  onDecline,
  onRemove,
  selectedFriend,
  onSelectFriend,
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <input
          value={addUsername}
          onChange={(e) => setAddUsername(e.target.value)}
          placeholder="Add by username (e.g. @john)"
          className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
        />
        <button
          type="button"
          onClick={onRequest}
          disabled={!canRequest || submitting}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-xs text-slate-500">Loading…</div>
      ) : (
        <>
          {state.incoming?.length ? (
            <section className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Requests ({state.incoming.length})
              </h3>
              <ul className="mt-2 space-y-1.5">
                {state.incoming.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2"
                  >
                    <span className="text-xs text-slate-200">{displayHandle(u.username)}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onAccept(u.username)}
                        disabled={submitting}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecline(u.username)}
                        disabled={submitting}
                        className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60 disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h3 className="text-xs font-medium text-slate-400">
              Friends ({state.friends?.length || 0})
            </h3>
            <ul className="mt-2 space-y-1.5">
              {state.friends?.length ? (
                state.friends.map((f) => {
                  const active = selectedFriend?.username === f.username;
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => onSelectFriend(f)}
                        className={[
                          "flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                          active
                            ? "border-indigo-500/40 bg-indigo-500/10"
                            : "border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 text-[11px] font-semibold text-slate-100 shadow-sm">
                            {initials(f.username)}
                          </span>
                          <span className="text-xs font-medium text-slate-100">
                            {displayHandle(f.username)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemove(f.username);
                          }}
                          disabled={submitting}
                          className="rounded-md border border-slate-800/80 bg-slate-950/30 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-950/60 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="text-xs text-slate-500">No friends yet.</li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
