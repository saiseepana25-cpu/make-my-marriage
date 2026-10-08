import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { createActivity, listActivities } from "@/features/activities/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function GET(request: Request) { return handleApi(async () => apiSuccess(await listActivities(new URL(request.url).searchParams)), "activities.list"); }
export function POST(request: Request) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await createActivity(await readAuthJson(request, 32 * 1024)), "Update created successfully", 201); }, "activities.create");
}
