import { requireCurrentUser } from "@/features/auth/current-user";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";

export function GET() {
  return handleApi(async () => apiSuccess(await requireCurrentUser()), "auth.me");
}
