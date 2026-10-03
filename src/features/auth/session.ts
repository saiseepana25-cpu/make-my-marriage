import "server-only";
import { unavailable } from "@/lib/api/errors";

export interface SessionIdentity { userId: string }

/** Future adapter owns HttpOnly cookies, production Secure/SameSite settings,
 * expiry, revocation and persistence. No cookie/token format is assumed here. */
export interface SessionService {
  read(cookieHeader: string | null): Promise<SessionIdentity | null>;
  create(userId: string): Promise<void>;
  revoke(): Promise<void>;
}

// Replace with the approved adapter at this composition point. Deny by default.
export const sessionService: SessionService = {
  async read() { return null; },
  async create() { throw unavailable("Session persistence"); },
  async revoke() { throw unavailable("Session persistence"); },
};

