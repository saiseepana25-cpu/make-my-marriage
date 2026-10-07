import { requirePermission } from "@/features/auth/authorization";
import { dashboardEvents, dashboardSection, dashboardTasks } from "@/features/dashboard/service";
import { handleApi, apiSuccess } from "@/lib/api/response";
import { validationError } from "@/lib/api/validation";
import { budgetSummary } from "@/features/expenses/service";

export const runtime = "nodejs";
export function GET(request: Request) {
  return handleApi(async () => {
    // Authentication fails the request, rather than masquerading as a section error.
    await requirePermission("dashboard:read");
    const section = new URL(request.url).searchParams.get("section");
    if (section === "tasks") return apiSuccess(await dashboardTasks());
    if (section === "events") return apiSuccess(await dashboardEvents());
    if (section === "budget") return apiSuccess(await budgetSummary());
    if (section !== null) validationError("Choose tasks, events or budget for the dashboard section.");
    const [tasks, events, budget] = await Promise.all([
      dashboardSection(dashboardTasks, "dashboard.tasks"), dashboardSection(dashboardEvents, "dashboard.events"),
      dashboardSection(budgetSummary, "dashboard.budget"),
    ]);
    return apiSuccess({ tasks, events, budget });
  }, "dashboard.read");
}
