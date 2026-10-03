import "server-only";
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requiredServerEnv } from "@/config/server-env";
import { AppError } from "@/lib/api/errors";
import { requireObjectId, validationError } from "@/lib/api/validation";

export interface ImageUploadPolicy {
  allowedMimeTypes: readonly string[];
  maxFileSizeBytes: number;
}
export interface ImageUploadRequest {
  weddingId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

const extensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/gif": "gif", "image/avif": "avif",
};
const URL_EXPIRY_SECONDS = 300;
let client: S3Client | undefined;

function storage() {
  const region = requiredServerEnv("AWS_REGION");
  const bucket = requiredServerEnv("AWS_S3_BUCKET");
  client ??= new S3Client({
    region,
    // The browser supplies the body later. Do not sign a checksum of an empty body.
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: requiredServerEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requiredServerEnv("AWS_SECRET_ACCESS_KEY"),
      sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
    },
  });
  return { client, bucket };
}

function assertGalleryKey(weddingId: string, key: string) {
  requireObjectId(weddingId, "weddingId");
  if (!key.startsWith(`weddings/${weddingId}/gallery/`) || key.includes("..")) {
    validationError("Image key does not belong to this wedding gallery.");
  }
}

/** Caller must authorize the wedding/event and enforce durable rate limits first.
 * These are infrastructure utilities, not public upload endpoints. */
export async function createPresignedUpload(input: ImageUploadRequest, policy: ImageUploadPolicy) {
  requireObjectId(input.weddingId, "weddingId");
  if (!Number.isSafeInteger(policy.maxFileSizeBytes) || policy.maxFileSizeBytes <= 0) {
    throw new Error("Image upload policy requires a positive maximum file size.");
  }
  const extension = extensions[input.mimeType];
  if (!extension || !policy.allowedMimeTypes.includes(input.mimeType)) validationError("Image type is not allowed.");
  if (!input.fileName.trim() || input.fileName.length > 255) validationError("File name is invalid.");
  if (!Number.isSafeInteger(input.fileSize) || input.fileSize <= 0) validationError("File size is invalid.");
  if (input.fileSize > policy.maxFileSizeBytes) {
    throw new AppError("UPLOAD_ERROR", "Image exceeds the allowed size.", 413);
  }
  const s3Key = `weddings/${input.weddingId}/gallery/${randomUUID()}.${extension}`;
  const { client, bucket } = storage();
  const command = new PutObjectCommand({
    Bucket: bucket, Key: s3Key, ContentType: input.mimeType, ContentLength: input.fileSize,
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: URL_EXPIRY_SECONDS,
    signableHeaders: new Set(["content-type"]),
  });
  return {
    s3Key, uploadUrl, expiresIn: URL_EXPIRY_SECONDS,
    headers: { "Content-Type": input.mimeType },
  };
}

/** Complete handlers must also bind the key to the issued upload authorization.
 * HEAD confirms existence/type/size before metadata persistence; it is not authorization. */
export async function verifyUploadedImage(input: ImageUploadRequest & { s3Key: string }) {
  assertGalleryKey(input.weddingId, input.s3Key);
  const { client, bucket } = storage();
  const object = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: input.s3Key }));
  if (object.ContentLength !== input.fileSize || object.ContentType !== input.mimeType) {
    throw new AppError("UPLOAD_ERROR", "Uploaded image does not match the approved upload.", 400);
  }
  return { fileSize: object.ContentLength, mimeType: object.ContentType };
}

export async function createPresignedDownload(weddingId: string, s3Key: string) {
  assertGalleryKey(weddingId, s3Key);
  const { client, bucket } = storage();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: s3Key }), {
    expiresIn: URL_EXPIRY_SECONDS,
  });
}

export async function deleteStoredImage(weddingId: string, s3Key: string): Promise<void> {
  assertGalleryKey(weddingId, s3Key);
  const { client, bucket } = storage();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
}
