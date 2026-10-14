import { apiSuccess, handleApi } from "@/lib/api/response";
import { getPublicWedding } from "@/features/website/service";

export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  return handleApi(async () => apiSuccess(await getPublicWedding((await context.params).slug)), "website.read");
}
