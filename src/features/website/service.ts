import "server-only";
import { connectDatabase } from "@/lib/db";
import { AppError } from "@/lib/api/errors";
import { pagination } from "@/lib/api/validation";
import { WeddingModel } from "@/models/wedding";
import { EventModel } from "@/models/event";
import { safeLivestreamUrl, validWebsiteSlug } from "./format";
import type { PublicWedding, WebsiteEvents } from "./types";

const missing = () => new AppError("NOT_FOUND", "This wedding website is unavailable.", 404);

async function resolveWedding(slug: string) {
  // Reject malformed paths before connecting. Public reads never resolve a session.
  if (!validWebsiteSlug(slug)) throw missing();
  await connectDatabase();
  const wedding = await WeddingModel.findOne({ websiteSlug: slug })
    .select("groomName brideName weddingDate location websiteSlug").lean();
  if (!wedding) throw missing();
  return wedding;
}

export async function getPublicWedding(slug: string): Promise<PublicWedding> {
  const wedding = await resolveWedding(slug);
  // Explicit DTO: never spread a document into a public response or RSC prop.
  return { groomName: wedding.groomName, brideName: wedding.brideName,
    weddingDate: wedding.weddingDate.toISOString(), location: wedding.location, websiteSlug: wedding.websiteSlug };
}

export async function loadPublicWeddingPage(slug: string) {
  const wedding = await getPublicWedding(slug);
  // A failed schedule is distinct from a successful empty schedule.
  const events = await listPublicEvents(slug, new URLSearchParams({ limit: "3" })).catch(() => null);
  return { wedding, events, asOf: Date.now() };
}

export async function listPublicEvents(slug: string, search = new URLSearchParams()): Promise<WebsiteEvents> {
  const { page, limit, skip } = pagination(search);
  const wedding = await resolveWedding(slug);
  const scope = { weddingId: wedding._id };
  const [events, total] = await Promise.all([
    EventModel.find(scope).select("name startAt endAt venue location description livestreamUrl")
      .sort({ startAt: 1, _id: 1 }).skip(skip).limit(limit).lean(),
    EventModel.countDocuments(scope),
  ]);
  return {
    events: events.map(event => ({ id: event._id.toString(), name: event.name, startAt: event.startAt.toISOString(),
      endAt: event.endAt?.toISOString(), venue: event.venue, location: event.location ?? undefined,
      description: event.description ?? undefined, livestreamUrl: safeLivestreamUrl(event.livestreamUrl) })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
