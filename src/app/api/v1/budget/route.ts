import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { budgetSummary, updateBudget } from "@/features/expenses/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function GET() { return handleApi(async () => apiSuccess(await budgetSummary()), "budget.read"); }
export function PUT(request: Request) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await updateBudget(await readAuthJson(request, 32 * 1024)), "Budget saved successfully"); }, "budget.update");
}
