import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const BUCKET = process.env.R2_BUCKET || "";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

export const r2Configured = Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET && PUBLIC_URL);

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