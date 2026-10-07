import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { deleteExpense, getExpense, updateExpense } from "@/features/expenses/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
type Context = { params: Promise<{ expenseId: string }> };
export function GET(_request: Request, context: Context) {
  return handleApi(async () => apiSuccess(await getExpense((await context.params).expenseId)), "expenses.get");
}
export function PUT(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await updateExpense((await context.params).expenseId, await readAuthJson(request, 32 * 1024)), "Expense updated successfully"); }, "expenses.update");
}
export function DELETE(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); await deleteExpense((await context.params).expenseId); return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }, "expenses.delete");
}
