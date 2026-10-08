import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { deleteGuest, getGuest, updateGuest } from "@/features/guests/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
type Context = { params: Promise<{ guestId: string }> };
export function GET(_request: Request, context: Context) { return handleApi(async () => apiSuccess(await getGuest((await context.params).guestId)), "guests.get"); }
export function PUT(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await updateGuest((await context.params).guestId, await readAuthJson(request, 32 * 1024)), "Guest updated successfully"); }, "guests.update");
}
export function DELETE(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); await deleteGuest((await context.params).guestId); return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }, "guests.delete");
}
