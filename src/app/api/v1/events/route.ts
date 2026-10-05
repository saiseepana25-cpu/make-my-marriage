import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { createEvent, listEvents } from "@/features/events/service";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";

export function GET(request: Request) {
  return handleApi(async () => apiSuccess(await listEvents(new URL(request.url).searchParams)), "events.list");
}

export function POST(request: Request) {
  return handleApi(async () => {
    assertAuthOrigin(request);
    return apiSuccess(await createEvent(await readAuthJson(request, 32 * 1024)), "Event created successfully", 201);
  }, "events.create");
}
