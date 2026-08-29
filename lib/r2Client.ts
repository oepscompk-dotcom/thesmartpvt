export async function uploadFile(file: File, folder = "files"): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json && typeof json.url === "string") return json.url;
    if (json && json.error) throw new Error(json.error);
    return null;
  } catch (err: any) {
    alert(err?.message || "Upload failed");
    return null;
  }
}

export function isRemoteUrl(value: string | undefined | null): boolean {
  return typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));
}

export async function deleteRemoteFile(value: string | undefined | null) {
  if (!value || !isRemoteUrl(value)) return;
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: value }),
    });
  } catch {}
}