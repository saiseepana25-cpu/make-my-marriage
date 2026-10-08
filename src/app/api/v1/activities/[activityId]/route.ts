import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { deleteActivity, getActivity, updateActivity } from "@/features/activities/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
type Context = { params: Promise<{ activityId: string }> };
export function GET(_request: Request, context: Context) { return handleApi(async () => apiSuccess(await getActivity((await context.params).activityId)), "activities.get"); }
export function PUT(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await updateActivity((await context.params).activityId, await readAuthJson(request, 32 * 1024)), "Update saved successfully"); }, "activities.update");
}
export function DELETE(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); await deleteActivity((await context.params).activityId); return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }, "activities.delete");
}
