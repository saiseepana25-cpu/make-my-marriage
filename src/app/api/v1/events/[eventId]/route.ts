import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { deleteEvent, getEvent, updateEvent } from "@/features/events/service";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";
type Context = { params: Promise<{ eventId: string }> };

export function GET(_request: Request, context: Context) {
  return handleApi(async () => apiSuccess(await getEvent((await context.params).eventId)), "events.get");
}

export function PUT(request: Request, context: Context) {
  return handleApi(async () => {
    assertAuthOrigin(request);
    return apiSuccess(await updateEvent((await context.params).eventId, await readAuthJson(request, 32 * 1024)), "Event updated successfully");
  }, "events.update");
}

export function DELETE(request: Request, context: Context) {
  return handleApi(async () => {
    assertAuthOrigin(request);
    await deleteEvent((await context.params).eventId);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }, "events.delete");
}
