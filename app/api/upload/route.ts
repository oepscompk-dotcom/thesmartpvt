import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { uploadToR2, deleteFromR2, keyFromUrl, r2Configured } from "@/lib/r2";

const FOLDERS = ["logos", "photos", "documents", "media", "files"];
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml", "image/bmp", "image/avif"];
const DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/mpeg"];
const MAX_SIZE = 100 * 1024 * 1024;

function extensionFor(type: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp",
    "image/svg+xml": "svg", "image/gif": "gif", "image/bmp": "bmp", "image/avif": "avif",
    "application/pdf": "pdf", "text/plain": "txt", "text/csv": "csv",
    "audio/mpeg": "mp3",
  };
  if (map[type]) return map[type];
  const last = type.split("/").pop() || "bin";
  return last.replace("quicktime", "mov").replace("x-msvideo", "avi") || "bin";
}

export async function POST(req: NextRequest) {
  if (!r2Configured) {
    return NextResponse.json({ error: "R2 storage is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_URL environment variables." }, { status: 503 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "files").replace(/[^a-z0-9_-]/gi, "");
    if (!(file instanceof File)) return NextResponse.json({ error: "file is required (multipart form field 'file')" }, { status: 400 });
    if (!FOLDERS.includes(folder)) return NextResponse.json({ error: `folder must be one of: ${FOLDERS.join(", ")}` }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength === 0) return NextResponse.json({ error: "empty file" }, { status: 400 });
    if (buffer.byteLength > MAX_SIZE) return NextResponse.json({ error: "File exceeds 100MB limit" }, { status: 413 });

    const type = file.type || "application/octet-stream";
    const allowed = IMAGE_TYPES.includes(type) || DOC_TYPES.includes(type) || VIDEO_TYPES.includes(type) || type === "application/octet-stream";
    if (!allowed) return NextResponse.json({ error: `Unsupported file type: ${type}` }, { status: 400 });

    const ext = extensionFor(type);
    const key = `${folder}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
    const { url } = await uploadToR2(buffer, key, type);
    return NextResponse.json({ url, key });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!r2Configured) return NextResponse.json({ error: "R2 storage is not configured." }, { status: 503 });
  try {
    const { url } = await req.json();
    const key = keyFromUrl(typeof url === "string" ? url : "");
    if (!key) return NextResponse.json({ error: "url not managed by this R2 bucket" }, { status: 400 });
    await deleteFromR2(key);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}