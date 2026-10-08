import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { createGuest, listGuests } from "@/features/guests/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function GET(request: Request) { return handleApi(async () => apiSuccess(await listGuests(new URL(request.url).searchParams)), "guests.list"); }
export function POST(request: Request) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await createGuest(await readAuthJson(request, 32 * 1024)), "Guest created successfully", 201); }, "guests.create");
}
