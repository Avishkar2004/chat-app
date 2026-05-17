import { useEffect, useRef } from "react";

/** Scroll a message list to the bottom when the conversation or length changes. */
export function useAutoScroll(deps = []) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return listRef;
}
