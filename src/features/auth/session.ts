import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { ClientSession } from "mongoose";
import type { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/db";
import { requireObjectId } from "@/lib/api/validation";
import { SessionModel } from "@/models/session";
import { ensureAuthIndexes } from "./indexes";

export interface SessionIdentity { userId: string }

export const SESSION_SECONDS = 30 * 24 * 60 * 60;
export interface IssuedSession { token: string; expiresAt: Date }

export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? "__Host-mmm_session" : "mmm_session";
}

export function readSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const prefix = `${sessionCookieName()}=`;
  const matches = cookieHeader.split(";").map(part => part.trim()).filter(part => part.startsWith(prefix));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(prefix.length);
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function setSessionCookie(response: NextResponse, session: IssuedSession | null): void {
  response.cookies.set(sessionCookieName(), session?.token ?? "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
    maxAge: session ? SESSION_SECONDS : 0, expires: session?.expiresAt ?? new Date(0),
  });
}

export async function createSessionRecord(userId: string, transaction?: ClientSession): Promise<IssuedSession> {
  requireObjectId(userId, "userId");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await SessionModel.create([{ userId, tokenHash: hashSessionToken(token), expiresAt }], { session: transaction });
  return { token, expiresAt };
}

export interface SessionService {
  read(cookieHeader: string | null): Promise<SessionIdentity | null>;
  create(userId: string): Promise<IssuedSession>;
  revoke(cookieHeader: string | null, transaction?: ClientSession): Promise<void>;
}

export const sessionService: SessionService = {
  async read(cookieHeader) {
    const token = readSessionToken(cookieHeader);
    if (!token) return null;
    await connectDatabase();
    const session = await SessionModel.findOne({ tokenHash: hashSessionToken(token), expiresAt: { $gt: new Date() } })
      .select("userId").lean();
    return session ? { userId: session.userId.toString() } : null;
  },
  async create(userId) {
    requireObjectId(userId, "userId");
    await ensureAuthIndexes();
    return createSessionRecord(userId);
  },
  async revoke(cookieHeader, transaction) {
    const token = readSessionToken(cookieHeader);
    if (!token) return;
    await connectDatabase();
    await SessionModel.deleteOne({ tokenHash: hashSessionToken(token) }, { session: transaction });
  },
};
