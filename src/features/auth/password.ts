import "server-only";
import bcrypt from "bcryptjs";
import { validationError } from "@/lib/api/validation";

const BCRYPT_ROUNDS = 12;

function validPasswordLength(password: string): boolean {
  const length = Buffer.byteLength(password, "utf8");
  return length > 0 && length <= 72;
}

export async function hashPassword(password: string): Promise<string> {
  if (!validPasswordLength(password)) validationError("Password must contain between 1 and 72 UTF-8 bytes.");
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!validPasswordLength(password)) return false;
  return bcrypt.compare(password, hash);
}

