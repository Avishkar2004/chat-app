import { api } from "../api";

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  return api("/api/uploads", { method: "POST", body: form });
}
