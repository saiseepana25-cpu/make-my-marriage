import type { Metadata } from "next";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getCurrentWedding } from "@/features/weddings/service";
import { BudgetOverview } from "@/components/expenses/budget-overview";
export const metadata: Metadata = { title: "Budget & Expenses", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const user = await requirePageUser();
  const [wedding, search] = await Promise.all([getCurrentWedding(), searchParams]);
  return <BudgetOverview manage={hasPermission(user.role, "expenses:manage")} couple={`${wedding.groomName} & ${wedding.brideName}`} saved={search.saved === "budget"} deleted={search.deleted === "1"} />;
}
