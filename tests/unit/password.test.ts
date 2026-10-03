// @vitest-environment node
import { expect, test } from "vitest";
import { comparePassword, hashPassword } from "@/features/auth/password";

test("passwords are hashed and compared without storing plaintext", async () => {
  const hash = await hashPassword("a-test-password");
  expect(hash).not.toContain("a-test-password");
  expect(await comparePassword("a-test-password", hash)).toBe(true);
  expect(await comparePassword("incorrect-password", hash)).toBe(false);
}, 15_000);

test("bcrypt truncation cannot authenticate an overlong UTF-8 password", async () => {
  await expect(hashPassword("é".repeat(37))).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  expect(await comparePassword("x".repeat(73), "unused")).toBe(false);
});
