import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { expenseEventOptions } from "@/features/expenses/service";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { BackToBudget } from "@/components/expenses/expense-ui";
export const metadata: Metadata = { title: "Add expense", robots: { index: false, follow: false } };
export default async function Page() {
  const user = await requirePageUser(); if (!hasPermission(user.role, "expenses:manage")) redirect("/budget");
  const events = await expenseEventOptions();
  return <div className="mx-auto max-w-6xl space-y-6"><BackToBudget /><div><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Add expense</h1><p className="mt-3 text-sm text-secondary">Record a planned or paid cost for your wedding celebrations.</p></div><ExpenseForm events={events} /></div>;
}
