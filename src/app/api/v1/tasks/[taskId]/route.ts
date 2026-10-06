import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { deleteTask, getTask, updateTask } from "@/features/tasks/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
type Context = { params: Promise<{ taskId: string }> };
export function GET(_request: Request, context: Context) {
  return handleApi(async () => apiSuccess(await getTask((await context.params).taskId)), "tasks.get");
}
export function PUT(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await updateTask((await context.params).taskId, await readAuthJson(request, 32 * 1024)), "Task updated successfully"); }, "tasks.update");
}
export function DELETE(request: Request, context: Context) {
  return handleApi(async () => { assertAuthOrigin(request); await deleteTask((await context.params).taskId); return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }, "tasks.delete");
}
