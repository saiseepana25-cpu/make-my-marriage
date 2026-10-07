import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { createExpense, listExpenses } from "@/features/expenses/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function GET(request: Request) {
  return handleApi(async () => apiSuccess(await listExpenses(new URL(request.url).searchParams)), "expenses.list");
}
export function POST(request: Request) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await createExpense(await readAuthJson(request, 32 * 1024)), "Expense created successfully", 201); }, "expenses.create");
}
