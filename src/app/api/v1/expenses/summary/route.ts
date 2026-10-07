import { budgetSummary } from "@/features/expenses/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function GET() { return handleApi(async () => apiSuccess(await budgetSummary()), "expenses.summary"); }
