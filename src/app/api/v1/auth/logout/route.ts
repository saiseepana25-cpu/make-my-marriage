import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { sessionService, setSessionCookie } from "@/features/auth/session";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";

export function POST(request: Request) {
  return handleApi(async () => {
    assertAuthOrigin(request);
    await readAuthJson(request);
    await sessionService.revoke(request.headers.get("cookie"));
    const response = apiSuccess(null, "You have been logged out.");
    setSessionCookie(response, null);
    return response;
  }, "auth.logout");
}
