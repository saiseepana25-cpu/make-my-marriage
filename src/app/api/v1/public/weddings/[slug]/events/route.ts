import { apiSuccess, handleApi } from "@/lib/api/response";
import { listPublicEvents } from "@/features/website/service";

export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  return handleApi(async () => apiSuccess(await listPublicEvents((await context.params).slug, new URL(request.url).searchParams)), "website.events.read");
}
