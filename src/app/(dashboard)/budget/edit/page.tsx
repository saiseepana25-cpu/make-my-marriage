import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { budgetSummary } from "@/features/expenses/service";
import { BudgetForm } from "@/components/expenses/budget-form";
import { BackToBudget } from "@/components/expenses/expense-ui";
export const metadata: Metadata = { title: "Set or edit wedding budget", robots: { index: false, follow: false } };
export default async function Page() {
  const user = await requirePageUser(); if (!hasPermission(user.role, "budget:manage")) redirect("/budget");
  const summary = await budgetSummary();
  return <div className="mx-auto max-w-5xl space-y-6"><BackToBudget /><div><h1 className="font-display-md text-3xl text-primary sm:text-4xl">{summary.totalBudget === null ? "Set wedding budget" : "Edit wedding budget"}</h1><p className="mt-3 text-sm text-secondary">A shared plan for your wedding expenses.</p></div><BudgetForm summary={summary} /></div>;
}
