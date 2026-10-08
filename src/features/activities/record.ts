import "server-only";
import type { ClientSession } from "mongoose";
import { ActivityModel } from "@/models/activity";
import type { CurrentUser } from "@/types/domain";

let indexes: Promise<void> | undefined;
export async function ensureActivityIndexes() {
  indexes ??= ActivityModel.createIndexes().then(() => undefined).catch(error => { indexes = undefined; throw error; });
  await indexes;
}
// Call only from a wedding-scoped mutation after validating/locking its references.
// The source mutation and its activity commit together, including transaction retries.
export async function recordSystemActivity(user: CurrentUser, session: ClientSession, data: {
  title: string; description: string; activityType: "Events" | "Tasks" | "Expenses" | "Guests"; relatedEventId?: string;
}) {
  await ActivityModel.create([{ ...data, weddingId: user.weddingId, createdBy: user.id, sourceType: "SYSTEM" }], { session });
}
