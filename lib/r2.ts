import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const BUCKET = process.env.R2_BUCKET || "";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

export const R2_ENV_VARS: Record<string, string> = {
  R2_ACCOUNT_ID: ACCOUNT_ID,
  R2_ACCESS_KEY_ID: ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY,
  R2_BUCKET: BUCKET,
  R2_PUBLIC_URL: PUBLIC_URL,
};

export function r2ConfigStatus() {
  const missing = Object.entries(R2_ENV_VARS)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return { configured: missing.length === 0, missing };
}

export const r2Configured = r2ConfigStatus().configured;

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  client = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
  });
  return client;
}

export async function uploadToR2(buffer: Buffer, key: string, contentType: string) {
  await getClient().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType })
  );
  return { url: `${PUBLIC_URL}/${key}`, key };
}

export async function deleteFromR2(key: string) {
  if (!key) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {}
}

export function keyFromUrl(url: string): string | null {
  if (!url || !PUBLIC_URL) return null;
  if (url.startsWith(PUBLIC_URL + "/")) return url.slice(PUBLIC_URL.length + 1);
  return null;
}