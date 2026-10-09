import { getCurrentWedding, updateCurrentWedding } from "@/features/weddings/service";
import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";

export function GET() {
  return handleApi(async () => apiSuccess(await getCurrentWedding()), "weddings.current");
}

export function PUT(request: Request) {
  return handleApi(async () => {
    assertAuthOrigin(request);
    return apiSuccess(await updateCurrentWedding(await readAuthJson(request)), "Wedding details updated successfully.");
  }, "weddings.update");
}
