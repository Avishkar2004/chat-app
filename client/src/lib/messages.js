/** Append a message unless that id is already in the list. */
export function appendMessage(list, message) {
  if (list.some((m) => m.id === message.id)) return list;
  return [...list, message];
}
