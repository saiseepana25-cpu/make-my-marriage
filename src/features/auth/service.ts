import "server-only";
import { connectDatabase } from "@/lib/db";
import { UserModel } from "@/models/user";
import { comparePassword, hashPassword } from "@/features/auth/password";
import { parseLoginRequest, parseSignupRequest } from "@/features/auth/requests";

let dummyHash: Promise<string> | undefined;

// Invoked only by future rate-limited login handlers. Does not create a session.
export async function verifyCredentials(input: unknown): Promise<string | null> {
  const credentials = parseLoginRequest(input);
  const fallbackHash = await (dummyHash ??= hashPassword("unused-comparison-password"));
  await connectDatabase();
  const user = await UserModel.findOne({ email: credentials.email }).select("+passwordHash");
  // Use equivalent bcrypt work for missing users; avoid an email-existence timing shortcut.
  const hash = user?.passwordHash ?? fallbackHash;
  const matches = await comparePassword(credentials.password, hash);
  return user && matches ? user._id.toString() : null;
}

export async function prepareSignup(input: unknown) {
  const { password, ...profile } = parseSignupRequest(input);
  return { ...profile, passwordHash: await hashPassword(password) };
  // Persistence and OWNER assignment await the onboarding conflict resolution.
}
