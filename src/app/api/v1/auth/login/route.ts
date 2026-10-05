import { assertAuthOrigin, limitAuthIp, readAuthJson } from "@/features/auth/http";
import { parseLoginRequest } from "@/features/auth/requests";
import { loginUser } from "@/features/auth/service";
import { setSessionCookie } from "@/features/auth/session";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";
import { apiSuccess, handleApi } from "@/lib/api/response";

export const runtime = "nodejs";

export function POST(request: Request) {
  return handleApi(async () => {
    assertAuthOrigin(request);
    const ip = await limitAuthIp(request, "login");
    const credentials = parseLoginRequest(await readAuthJson(request));
    await enforceRateLimit({ scope: "login", key: `pair:${ip}:${credentials.email}`, limit: 5, windowSeconds: 900 });
    const result = await loginUser(credentials, request.headers.get("cookie"));
    const response = apiSuccess(result.user, "Welcome back.");
    setSessionCookie(response, result.session);
    return response;
  }, "auth.login");
}
