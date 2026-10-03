import type { ActivitySource, CurrentUser, Role } from "@/types/domain";

const readPermissions = [
  "dashboard:read", "events:read", "tasks:read", "guests:read",
  "budget:read", "expenses:read", "photos:read", "activities:read", "members:read",
  "photos:upload", "activities:create",
] as const;
const managePermissions = [
  "wedding:update", "events:manage", "tasks:manage", "guests:manage",
  "budget:manage", "expenses:manage", "photos:manage", "activities:manage",
  "members:manage", "website:manage",
] as const;
export type Permission = (typeof readPermissions)[number]
  | (typeof managePermissions)[number] | "wedding:delete" | "ownership:manage";

const policies: Record<Role, readonly Permission[]> = {
  OWNER: [...readPermissions, ...managePermissions, "wedding:delete", "ownership:manage"],
  ADMIN: [...readPermissions, ...managePermissions],
  FAMILY_MEMBER: readPermissions,
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return policies[role]?.includes(permission) ?? false;
}

export function canUpdateTaskStatus(
  user: CurrentUser, task: { weddingId: string; assignedTo?: string | null },
): boolean {
  return user.weddingId === task.weddingId &&
    (hasPermission(user.role, "tasks:manage") || task.assignedTo === user.id);
}

export function canModifyActivity(
  user: CurrentUser, activity: { weddingId: string; createdBy: string; sourceType: ActivitySource },
): boolean {
  return user.weddingId === activity.weddingId && activity.sourceType === "MANUAL" &&
    (hasPermission(user.role, "activities:manage") || activity.createdBy === user.id);
}

export function canDeletePhoto(
  user: CurrentUser, photo: { weddingId: string; uploadedByUserId?: string | null },
): boolean {
  return user.weddingId === photo.weddingId &&
    (hasPermission(user.role, "photos:manage") || photo.uploadedByUserId === user.id);
}

