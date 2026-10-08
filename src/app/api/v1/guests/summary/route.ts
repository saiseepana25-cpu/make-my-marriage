import { guestSummary } from "@/features/guests/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function GET() { return handleApi(async () => apiSuccess(await guestSummary()), "guests.summary"); }
