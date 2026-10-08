import type { Metadata } from "next";
import { requirePageUser } from "@/features/auth/current-user";
import { dashboardOverview } from "@/features/dashboard/service";
import { hasPermission } from "@/features/auth/permissions";
import { FutureModules, WeddingOverview } from "@/components/dashboard/dashboard-ui";
import { DashboardPlanning } from "@/components/dashboard/dashboard-planning";
import { DashboardBudget } from "@/components/dashboard/dashboard-budget";
import { DashboardGuests } from "@/components/dashboard/dashboard-guests";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function Page() {
  await requirePageUser();
  const { user, wedding, asOf } = await dashboardOverview();
  const canAddTasks = hasPermission(user.role, "tasks:manage");
  const canAddEvents = hasPermission(user.role, "events:manage");
  return <div className="space-y-6 sm:space-y-8">
    <WeddingOverview wedding={wedding} asOf={asOf} canAddTasks={canAddTasks} canAddEvents={canAddEvents} />
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-6 sm:space-y-8">
        <DashboardPlanning canAddTasks={canAddTasks} canAddEvents={canAddEvents} />
      </div>
      <div className="min-w-0 space-y-5"><DashboardBudget manage={hasPermission(user.role, "budget:manage")} /><DashboardGuests manage={hasPermission(user.role, "guests:manage")} /><FutureModules /></div>
    </div>
  </div>;
}
