export const ROLES = ["OWNER", "ADMIN", "FAMILY_MEMBER"] as const;
export const RELATIONSHIP_TYPES = [
  "BRIDE", "GROOM", "BRIDE_MOTHER", "BRIDE_FATHER", "BRIDE_SISTER",
  "BRIDE_BROTHER", "GROOM_MOTHER", "GROOM_FATHER", "GROOM_SISTER", "GROOM_BROTHER",
] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const RSVP_STATUSES = ["PENDING", "ATTENDING", "NOT_ATTENDING"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PARTIALLY_PAID", "PAID"] as const;
export const ACTIVITY_SOURCES = ["MANUAL", "SYSTEM"] as const;
export type Role = (typeof ROLES)[number];
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type RsvpStatus = (typeof RSVP_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type ActivitySource = (typeof ACTIVITY_SOURCES)[number];

export interface CurrentUser {
  id: string;
  weddingId: string;
  name: string;
  email: string;
  role: Role;
  relationshipType: RelationshipType;
}

