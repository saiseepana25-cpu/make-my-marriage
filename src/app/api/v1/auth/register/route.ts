import { assertAuthOrigin, limitAuthIp, readAuthJson } from "@/features/auth/http";
import { registerOwner } from "@/features/auth/service";
import { setSessionCookie } from "@/features/auth/session";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";

export function POST(request: Request) {
  return handleApi(async () => {
    assertAuthOrigin(request);
    await limitAuthIp(request, "signup");
    const result = await registerOwner(await readAuthJson(request), request.headers.get("cookie"));
    const response = apiSuccess(result.user, "Your wedding workspace is ready.", 201);
    setSessionCookie(response, result.session);
    return response;
  }, "auth.register");
}
