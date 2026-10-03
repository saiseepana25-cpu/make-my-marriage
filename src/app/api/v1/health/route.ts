import { apiSuccess } from "@/lib/api/response";

export const runtime = "nodejs";

export function GET() {
  return apiSuccess({ status: "ok" }, "Application is running");
}

