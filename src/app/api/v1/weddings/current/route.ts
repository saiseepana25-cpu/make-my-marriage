import { getCurrentWedding } from "@/features/weddings/service";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";

export function GET() {
  return handleApi(async () => apiSuccess(await getCurrentWedding()), "weddings.current");
}
