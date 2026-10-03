import { isRecord, validationError } from "@/lib/api/validation";
import { RELATIONSHIP_TYPES, type RelationshipType } from "@/types/domain";

export interface LoginRequest { email: string; password: string }
export interface SignupRequest extends LoginRequest {
  name: string;
  relationshipType: RelationshipType;
  // No role or weddingId accepted from public registration.
  // Onboarding data must be finalized before registration persistence is added.
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseLoginRequest(input: unknown): LoginRequest {
  if (!isRecord(input)) validationError("Credentials must be an object.");
  if (typeof input.email !== "string" || typeof input.password !== "string") {
    validationError("Email and password are required.");
  }
  const email = normalizeEmail(input.email);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) validationError("Email is invalid.");
  if (!input.password || new TextEncoder().encode(input.password).length > 72) {
    validationError("Password must contain between 1 and 72 UTF-8 bytes.");
  }
  return { email, password: input.password };
}

export function parseSignupRequest(input: unknown): SignupRequest {
  const credentials = parseLoginRequest(input);
  if (!isRecord(input)) validationError("Registration must be an object.");
  if (typeof input.name !== "string" || !input.name.trim()) validationError("Name is required.");
  const relationshipType = RELATIONSHIP_TYPES.find((value) => value === input.relationshipType);
  if (!relationshipType) validationError("Relationship type is invalid.");
  // Password strength policy is finalized with account creation, not silently invented here.
  return { ...credentials, name: input.name.trim(), relationshipType };
}

