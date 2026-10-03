import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connectDatabase } from "@/lib/db";
import { AppError } from "@/lib/api/errors";
import { UserModel } from "@/models/user";
import { sessionService } from "@/features/auth/session";
import type { CurrentUser } from "@/types/domain";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const requestHeaders = await headers();
  const identity = await sessionService.read(requestHeaders.get("cookie"));
  if (!identity || !/^[a-f\d]{24}$/i.test(identity.userId)) return null;
  await connectDatabase();
  const user = await UserModel.findById(identity.userId)
    .select("weddingId name email role relationshipType").lean();
  if (!user) return null;
  return {
    id: user._id.toString(), weddingId: user.weddingId.toString(),
    name: user.name, email: user.email, role: user.role,
    relationshipType: user.relationshipType,
  };
});

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "Please log in to continue.", 401);
  return user;
}

export async function requirePageUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

