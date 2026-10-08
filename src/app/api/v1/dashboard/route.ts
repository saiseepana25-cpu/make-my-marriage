import { requirePermission } from "@/features/auth/authorization";
import { dashboardEvents, dashboardSection, dashboardTasks } from "@/features/dashboard/service";
import { handleApi, apiSuccess } from "@/lib/api/response";
import { validationError } from "@/lib/api/validation";
import { budgetSummary } from "@/features/expenses/service";
import { guestSummary } from "@/features/guests/service";
import { recentActivities } from "@/features/activities/service";

export const runtime = "nodejs";
export function GET(request: Request) {
  return handleApi(async () => {
    // Authentication fails the request, rather than masquerading as a section error.
    await requirePermission("dashboard:read");
    const section = new URL(request.url).searchParams.get("section");
    if (section === "tasks") return apiSuccess(await dashboardTasks());
    if (section === "events") return apiSuccess(await dashboardEvents());
    if (section === "budget") return apiSuccess(await budgetSummary());
    if (section === "guests") return apiSuccess(await guestSummary());
    if (section === "activities") return apiSuccess(await recentActivities());
    if (section !== null) validationError("Choose tasks, events, budget, guests or activities for the dashboard section.");
    const [tasks, events, budget, guests, activities] = await Promise.all([
      dashboardSection(dashboardTasks, "dashboard.tasks"), dashboardSection(dashboardEvents, "dashboard.events"),
      dashboardSection(budgetSummary, "dashboard.budget"),
      dashboardSection(guestSummary, "dashboard.guests"),
      dashboardSection(recentActivities, "dashboard.activities"),
    ]);
    return apiSuccess({ tasks, events, budget, guests, activities });
  }, "dashboard.read");
}
