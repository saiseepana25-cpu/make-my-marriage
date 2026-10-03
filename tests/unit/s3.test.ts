// @vitest-environment node
import { expect, test, vi } from "vitest";
import { createPresignedUpload } from "@/services/storage/s3";

const input = {
  weddingId: "507f1f77bcf86cd799439011",
  fileName: "wedding.jpg", mimeType: "image/jpeg", fileSize: 100,
};
const policy = { allowedMimeTypes: ["image/jpeg"], maxFileSizeBytes: 1024 };

test("presigning binds type and size without an empty-body checksum or network calls", async () => {
  vi.stubEnv("AWS_REGION", "us-east-1");
  vi.stubEnv("AWS_S3_BUCKET", "scaffold-test-bucket");
  vi.stubEnv("AWS_ACCESS_KEY_ID", "scaffold-test-key");
  vi.stubEnv("AWS_SECRET_ACCESS_KEY", "scaffold-test-secret");
  vi.stubEnv("AWS_SESSION_TOKEN", "");
  const result = await createPresignedUpload(input, policy);
  const url = new URL(result.uploadUrl);
  expect(result.s3Key).toMatch(/^weddings\/507f1f77bcf86cd799439011\/gallery\/[a-f\d-]+\.jpg$/);
  expect(result.headers).toEqual({ "Content-Type": "image/jpeg" });
  expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
  expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain("content-type");
  expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain("content-length");
  expect(url.searchParams.has("x-amz-checksum-crc32")).toBe(false);
});

test("invalid and oversized uploads fail before external services are used", async () => {
  await expect(createPresignedUpload({ ...input, mimeType: "image/svg+xml" }, policy))
    .rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  await expect(createPresignedUpload({ ...input, fileSize: 2048 }, policy))
    .rejects.toMatchObject({ status: 413 });
});

