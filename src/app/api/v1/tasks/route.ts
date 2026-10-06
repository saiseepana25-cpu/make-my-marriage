import { assertAuthOrigin, readAuthJson } from "@/features/auth/http";
import { createTask, listTasks } from "@/features/tasks/service";
import { apiSuccess, handleApi } from "@/lib/api/response";
export const runtime = "nodejs";
export function GET(request: Request) {
  return handleApi(async () => apiSuccess(await listTasks(new URL(request.url).searchParams)), "tasks.list");
}
export function POST(request: Request) {
  return handleApi(async () => { assertAuthOrigin(request); return apiSuccess(await createTask(await readAuthJson(request, 32 * 1024)), "Task created successfully", 201); }, "tasks.create");
}
