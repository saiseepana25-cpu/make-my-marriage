import { requirePermission } from "@/features/auth/authorization";
import { dashboardEvents, dashboardSection, dashboardTasks } from "@/features/dashboard/service";
import { handleApi, apiSuccess } from "@/lib/api/response";
import { validationError } from "@/lib/api/validation";

export const runtime = "nodejs";
export function GET(request: Request) {
  return handleApi(async () => {
    // Authentication fails the request, rather than masquerading as a section error.
    await requirePermission("dashboard:read");
    const section = new URL(request.url).searchParams.get("section");
    if (section === "tasks") return apiSuccess(await dashboardTasks());
    if (section === "events") return apiSuccess(await dashboardEvents());
    if (section !== null) validationError("Choose tasks or events for the dashboard section.");
    const [tasks, events] = await Promise.all([
      dashboardSection(dashboardTasks, "dashboard.tasks"), dashboardSection(dashboardEvents, "dashboard.events"),
    ]);
    return apiSuccess({ tasks, events });
  }, "dashboard.read");
}
