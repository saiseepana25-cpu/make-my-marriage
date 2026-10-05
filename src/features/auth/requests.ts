import { isRecord, validationError } from "@/lib/api/validation";
import { RELATIONSHIP_TYPES, type RelationshipType } from "@/types/domain";

export interface LoginRequest { email: string; password: string }
export interface SignupRequest extends LoginRequest {
  name: string;
  relationshipType: RelationshipType;
}

export interface WeddingSetupRequest {
  brideName: string; groomName: string; weddingDate: string; location: string;
}
export interface RegistrationRequest extends SignupRequest { wedding: WeddingSetupRequest }

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
  if (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 100) {
    validationError("Enter your name (up to 100 characters).");
  }
  const relationshipType = RELATIONSHIP_TYPES.find((value) => value === input.relationshipType);
  if (!relationshipType) validationError("Relationship type is invalid.");
  if (Array.from(credentials.password).length < 8) validationError("Use at least 8 characters for your password.");
  return { ...credentials, name: input.name.trim(), relationshipType };
}

export function parseWeddingSetupRequest(input: unknown): WeddingSetupRequest {
  if (!isRecord(input)) validationError("Wedding details are required.");
  const requiredText = (field: string, label: string, maximum: number) => {
    const value = input[field];
    if (typeof value !== "string" || !value.trim() || value.trim().length > maximum) {
      validationError(`Enter ${label} (up to ${maximum} characters).`);
    }
    return value.trim();
  };
  const groomName = requiredText("groomName", "the groom's name", 100);
  const brideName = requiredText("brideName", "the bride's name", 100);
  const location = requiredText("location", "your wedding location", 200);
  const weddingDate = input.weddingDate;
  if (typeof weddingDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(weddingDate)) {
    validationError("Choose a valid wedding date.");
  }
  const date = new Date(`${weddingDate}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== weddingDate) {
    validationError("Choose a valid wedding date.");
  }
  return { brideName, groomName, weddingDate, location };
}

export function parseRegistrationRequest(input: unknown): RegistrationRequest {
  const profile = parseSignupRequest(input);
  if (!isRecord(input)) validationError("Registration must be an object.");
  return { ...profile, wedding: parseWeddingSetupRequest(input.wedding) };
}
