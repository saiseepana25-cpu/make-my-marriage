import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { expenseEventOptions } from "@/features/expenses/service";
import { getPageExpense } from "@/features/expenses/page-data";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { BackToBudget } from "@/components/expenses/expense-ui";
export const metadata: Metadata = { title: "Edit expense", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ expenseId: string }> }) {
  const user = await requirePageUser(); if (!hasPermission(user.role, "expenses:manage")) redirect("/budget");
  const [{ expense }, events] = await Promise.all([getPageExpense((await params).expenseId), expenseEventOptions()]);
  return <div className="mx-auto max-w-6xl space-y-6"><BackToBudget /><div><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Edit expense</h1><p className="mt-3 text-sm text-secondary">Update this expense and its recorded payments.</p></div><ExpenseForm expense={expense} events={events} /></div>;
}
