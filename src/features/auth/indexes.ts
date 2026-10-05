import "server-only";
import { connectDatabase } from "@/lib/db";
import { UserModel } from "@/models/user";
import { WeddingModel } from "@/models/wedding";
import { SessionModel } from "@/models/session";
import { RateLimitModel } from "@/models/rate-limit";

let pending: Promise<void> | undefined;

// Explicit provisioning also runs with production autoIndex=false. No build-time I/O.
export async function ensureAuthIndexes(): Promise<void> {
  await connectDatabase();
  if (!pending) {
    pending = Promise.all([
      UserModel.createIndexes(), WeddingModel.createIndexes(),
      SessionModel.createIndexes(), RateLimitModel.createIndexes(),
    ]).then(() => undefined).catch(error => { pending = undefined; throw error; });
  }
  await pending;
}
