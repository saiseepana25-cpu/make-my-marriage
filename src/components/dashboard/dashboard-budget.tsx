"use client";
import Link from "next/link";
import type { BudgetSummary } from "@/features/expenses/types";
import { money } from "@/features/expenses/format";
import { useExpenseData } from "@/components/expenses/use-expense-data";
import { ExpenseFailure } from "@/components/expenses/budget-overview";
import { ExpenseSkeleton, primaryAction } from "@/components/expenses/expense-ui";
import { dashboardCard } from "./dashboard-ui";
export function DashboardBudget({ manage }: { manage: boolean }) {
  const { state, reload } = useExpenseData<BudgetSummary>("/api/v1/dashboard?section=budget");
  if (state.status === "loading") return <ExpenseSkeleton label="Loading budget" />;
  if (state.status === "error") return <ExpenseFailure label="budget" expired={state.expired} retry={reload} />;
  const summary = state.data, over = summary.remainingBudget !== null && summary.remainingBudget < 0;
  return <section className={dashboardCard} aria-labelledby="dashboard-budget-title"><div className="flex flex-wrap items-center justify-between gap-2"><h2 id="dashboard-budget-title" className="text-lg font-semibold">Budget &amp; Expenses</h2><Link href="/budget" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">View budget →</Link></div>
    {summary.totalBudget === null && <p className="mt-3 rounded-xl bg-surface-container-low p-3 text-sm text-secondary">Budget not set. {manage ? "Set your wedding budget to track utilization." : "The owner or an admin can set your wedding budget."}</p>}
    <dl className="mt-4 grid grid-cols-2 gap-3">{[["Wedding budget", summary.totalBudget], ["Total expenses", summary.totalExpenses], ["Total paid", summary.totalPaid], ["Outstanding", summary.outstanding], [over ? "Over budget by" : "Remaining budget", summary.remainingBudget === null ? null : Math.abs(summary.remainingBudget)]].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl bg-surface-container-low p-3"><dt className="text-[10px] font-semibold text-secondary">{label}</dt><dd className="mt-2 break-words text-sm font-semibold text-primary">{value === null ? label === "Wedding budget" ? "Not set" : "Unavailable" : money(Number(value))}</dd></div>)}</dl>
    <div className="mt-5"><p className="text-xs text-secondary">Budget used: {summary.utilization === null ? "Unavailable" : `${summary.utilization}%`}</p>{summary.utilization !== null && <div role="progressbar" aria-label="Dashboard budget utilization" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, summary.utilization)} aria-valuetext={`${summary.utilization}% of budget used`} className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-primary-container" style={{ width: `${Math.min(100, summary.utilization)}%` }} /></div>}</div>
    {manage && <Link href={summary.totalBudget === null ? "/budget/edit" : "/budget/expenses/new"} className={`${primaryAction} mt-5`}>{summary.totalBudget === null ? "Set budget" : "Add expense"}</Link>}
  </section>;
}
