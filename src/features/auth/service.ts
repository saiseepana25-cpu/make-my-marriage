import "server-only";
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
import { connectDatabase } from "@/lib/db";
import { AppError } from "@/lib/api/errors";
import { UserModel } from "@/models/user";
import { WeddingModel } from "@/models/wedding";
import { comparePassword, hashPassword } from "@/features/auth/password";
import { parseLoginRequest, parseRegistrationRequest } from "@/features/auth/requests";
import { createSessionRecord, sessionService } from "./session";
import { ensureAuthIndexes } from "./indexes";
import type { CurrentUser } from "@/types/domain";

let dummyHash: Promise<string> | undefined;

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

function userDto(user: {
  _id: mongoose.Types.ObjectId; weddingId: mongoose.Types.ObjectId; name: string;
  email: string; role: CurrentUser["role"]; relationshipType: CurrentUser["relationshipType"];
}): CurrentUser {
  return {
    id: user._id.toString(), weddingId: user.weddingId.toString(), name: user.name,
    email: user.email, role: user.role, relationshipType: user.relationshipType,
  };
}

export function weddingSlug(groom: string, bride: string): string {
  const names = `${groom}-${bride}`.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
  return `${names || "our-wedding"}-${randomBytes(8).toString("hex")}`;
}

export async function registerOwner(input: unknown, previousCookie: string | null) {
  const { wedding, ...credentials } = parseRegistrationRequest(input);
  await ensureAuthIndexes();
  if (await UserModel.exists({ email: credentials.email })) {
    throw new AppError("CONFLICT", "An account with this email already exists. Please log in.", 409);
  }
  const passwordHash = await hashPassword(credentials.password);
  const userId = new mongoose.Types.ObjectId();
  const weddingId = new mongoose.Types.ObjectId();
  return mongoose.connection.transaction(async transaction => {
    await WeddingModel.create([{
      _id: weddingId, ...wedding, weddingDate: new Date(`${wedding.weddingDate}T00:00:00.000Z`),
      websiteSlug: weddingSlug(wedding.groomName, wedding.brideName), createdBy: userId,
    }], { session: transaction });
    const [user] = await UserModel.create([{
      _id: userId, weddingId, name: credentials.name, email: credentials.email,
      passwordHash, role: "OWNER", relationshipType: credentials.relationshipType,
    }], { session: transaction });
    await sessionService.revoke(previousCookie, transaction);
    const session = await createSessionRecord(userId.toString(), transaction);
    return { user: userDto(user), session };
  });
}

export async function loginUser(input: unknown, previousCookie: string | null) {
  await ensureAuthIndexes();
  const userId = await verifyCredentials(input);
  const invalid = () => new AppError("UNAUTHENTICATED", "Email or password is incorrect.", 401);
  if (!userId) throw invalid();
  return mongoose.connection.transaction(async transaction => {
    const user = await UserModel.findById(userId).session(transaction).lean();
    if (!user || !await WeddingModel.exists({ _id: user.weddingId }).session(transaction)) throw invalid();
    await sessionService.revoke(previousCookie, transaction);
    const session = await createSessionRecord(userId, transaction);
    return { user: userDto(user), session };
  });
}
