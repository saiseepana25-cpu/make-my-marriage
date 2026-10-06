import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { updateTaskStatus } from "@/features/tasks/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await updateTaskStatus((await context.params).taskId, await readAuthJson(request)), "Task status updated successfully"); }, "tasks.status");
}
