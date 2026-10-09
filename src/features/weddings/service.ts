import "server-only";
import { requireCurrentUser } from "@/features/auth/current-user";
import { WeddingModel } from "@/models/wedding";
import { AppError } from "@/lib/api/errors";
import { requirePermission } from "@/features/auth/authorization";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";
import { parseWeddingPatch } from "./requests";
import type { CurrentWedding } from "./types";

type WeddingProjection = { _id: { toString(): string }; brideName: string; groomName: string; weddingDate: Date; location: string; websiteSlug: string };
const projection = "brideName groomName weddingDate location websiteSlug";
function serialize(wedding: WeddingProjection): CurrentWedding {
  return { id: wedding._id.toString(), brideName: wedding.brideName, groomName: wedding.groomName,
    weddingDate: wedding.weddingDate.toISOString(), location: wedding.location, websiteSlug: wedding.websiteSlug };
}

export async function getCurrentWedding() {
  const user = await requireCurrentUser();
  const wedding = await WeddingModel.findById(user.weddingId)
    .select(projection).lean();
  if (!wedding) throw new AppError("NOT_FOUND", "Your wedding workspace could not be found.", 404);
  return serialize(wedding);
}

export async function updateCurrentWedding(input: unknown): Promise<CurrentWedding> {
  const user = await requirePermission("wedding:update");
  await enforceRateLimit({ scope: "weddings", key: `user:${user.id}`, limit: 60, windowSeconds: 60 });
  const patch = parseWeddingPatch(input);
  const wedding = await WeddingModel.findOneAndUpdate({ _id: user.weddingId }, {
    $set: { ...patch, ...(patch.weddingDate ? { weddingDate: new Date(`${patch.weddingDate}T00:00:00.000Z`) } : {}) },
  }, { returnDocument: "after", runValidators: true }).select(projection).lean();
  if (!wedding) throw new AppError("NOT_FOUND", "Your wedding workspace could not be found.", 404);
  return serialize(wedding);
}
