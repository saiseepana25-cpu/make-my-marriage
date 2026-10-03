import "server-only";
import { AppError } from "@/lib/api/errors";
import { requireCurrentUser } from "@/features/auth/current-user";
import { hasPermission, type Permission } from "@/features/auth/permissions";
import type { CurrentUser } from "@/types/domain";

export function assertWeddingAccess(user: CurrentUser, weddingId: string): void {
  if (user.weddingId !== weddingId) throw new AppError("FORBIDDEN", "Access is not permitted.", 403);
}

export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireCurrentUser();
  if (!hasPermission(user.role, permission)) throw new AppError("FORBIDDEN", "Access is not permitted.", 403);
  return user;
}

// Private services derive the query scope here, never from a browser-supplied weddingId.
export function weddingScope(user: CurrentUser) {
  return { weddingId: user.weddingId };
}

