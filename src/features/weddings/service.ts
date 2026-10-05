import "server-only";
import { requireCurrentUser } from "@/features/auth/current-user";
import { WeddingModel } from "@/models/wedding";
import { AppError } from "@/lib/api/errors";

export async function getCurrentWedding() {
  const user = await requireCurrentUser();
  const wedding = await WeddingModel.findById(user.weddingId)
    .select("brideName groomName weddingDate location websiteSlug").lean();
  if (!wedding) throw new AppError("NOT_FOUND", "Your wedding workspace could not be found.", 404);
  return {
    id: wedding._id.toString(), brideName: wedding.brideName, groomName: wedding.groomName,
    weddingDate: wedding.weddingDate.toISOString(), location: wedding.location, websiteSlug: wedding.websiteSlug,
  };
}
