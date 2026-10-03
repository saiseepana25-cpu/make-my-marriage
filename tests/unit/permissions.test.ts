import { describe, expect, test } from "vitest";
import { canDeletePhoto, canModifyActivity, canUpdateTaskStatus, hasPermission } from "@/features/auth/permissions";
import type { CurrentUser } from "@/types/domain";

const family: CurrentUser = {
  id: "member-1", weddingId: "wedding-1", name: "Family",
  email: "family@example.com", role: "FAMILY_MEMBER", relationshipType: "BRIDE_SISTER",
};

describe("wedding authorization", () => {
  test("family can view finances and contribute without management powers", () => {
    expect(hasPermission(family.role, "budget:read")).toBe(true);
    expect(hasPermission(family.role, "expenses:read")).toBe(true);
    expect(hasPermission(family.role, "activities:create")).toBe(true);
    expect(hasPermission(family.role, "photos:upload")).toBe(true);
    expect(hasPermission(family.role, "expenses:manage")).toBe(false);
    expect(hasPermission(family.role, "wedding:delete")).toBe(false);
  });
  test("ownership privileges are exclusive to OWNER", () => {
    expect(hasPermission("OWNER", "wedding:delete")).toBe(true);
    expect(hasPermission("ADMIN", "wedding:delete")).toBe(false);
    expect(hasPermission("ADMIN", "ownership:manage")).toBe(false);
  });
  test("family task status updates require assignment and wedding scope", () => {
    expect(canUpdateTaskStatus(family, { weddingId: "wedding-1", assignedTo: family.id })).toBe(true);
    expect(canUpdateTaskStatus(family, { weddingId: "wedding-1", assignedTo: "other" })).toBe(false);
    expect(canUpdateTaskStatus({ ...family, role: "OWNER" }, { weddingId: "wedding-2" })).toBe(false);
  });
  test("system activities remain read-only for all app roles", () => {
    for (const role of ["OWNER", "ADMIN", "FAMILY_MEMBER"] as const) {
      expect(canModifyActivity({ ...family, role }, {
        weddingId: family.weddingId, createdBy: family.id, sourceType: "SYSTEM",
      })).toBe(false);
    }
    expect(canModifyActivity(family, {
      weddingId: family.weddingId, createdBy: family.id, sourceType: "MANUAL",
    })).toBe(true);
  });
  test("uploaders can delete only their own same-wedding photos", () => {
    expect(canDeletePhoto(family, { weddingId: family.weddingId, uploadedByUserId: family.id })).toBe(true);
    expect(canDeletePhoto(family, { weddingId: family.weddingId, uploadedByUserId: "other" })).toBe(false);
    expect(canDeletePhoto(family, { weddingId: "other-wedding", uploadedByUserId: family.id })).toBe(false);
  });
});

