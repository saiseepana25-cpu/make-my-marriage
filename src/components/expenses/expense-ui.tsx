import Link from "next/link";
import { money, paymentLabels } from "@/features/expenses/format";
import type { BudgetSummary } from "@/features/expenses/types";
import type { PaymentStatus } from "@/types/domain";
export { primaryAction, secondaryAction } from "@/components/tasks/task-ui";
export const expenseCard = "min-w-0 rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-7";
export const expenseInput = "w-full min-w-0 rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-base focus:border-primary focus:bg-surface-container-lowest sm:text-sm";
export function BackToBudget() { return <Link href="/budget" className="inline-flex min-h-11 items-center text-sm text-on-surface-variant hover:text-primary">← Back to budget &amp; expenses</Link>; }
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status === "PAID" ? "bg-secondary-container text-on-secondary-container" : status === "UNPAID" ? "bg-error-container text-on-error-container" : "bg-primary-fixed/50 text-primary"}`}>{paymentLabels[status]}</span>;
}
export function BudgetMetrics({ summary, compact = false }: { summary: BudgetSummary; compact?: boolean }) {
  const over = summary.remainingBudget !== null && summary.remainingBudget < 0;
  const metrics = [
    { label: "Wedding budget", value: summary.totalBudget === null ? "Not set" : money(summary.totalBudget), help: "Your overall wedding budget." },
    { label: "Total expenses", value: money(summary.totalExpenses), help: "Includes paid and unpaid amounts." },
    { label: over ? "Over budget by" : "Remaining budget", value: summary.remainingBudget === null ? "Not available" : money(Math.abs(summary.remainingBudget)), help: "Wedding budget minus total expenses." },
  ];
  return <section aria-label="Wedding budget summary" className="space-y-4">
    {over && <p role="status" className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">Over budget by <strong>{money(Math.abs(summary.remainingBudget!))}</strong>. Review your expenses or revise your budget.</p>}
    <dl className={`grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>{metrics.map(metric => <div key={metric.label} className={compact ? "rounded-xl bg-surface-container-low p-4" : expenseCard}><dt className="text-[10px] font-semibold uppercase tracking-wider text-secondary">{metric.label}</dt><dd className="mt-4 break-words font-display-md text-[26px] leading-tight text-primary sm:text-[30px]">{metric.value}</dd>{!compact && <p className="mt-2 text-xs text-secondary">{metric.help}</p>}</div>)}</dl>
    <div className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-[1fr_1fr_2.5fr]"}`}><dl className={expenseCard}><dt className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Total paid</dt><dd className="mt-3 break-words text-lg font-semibold">{money(summary.totalPaid)}</dd></dl><dl className={expenseCard}><dt className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Outstanding payments</dt><dd className="mt-3 break-words text-lg font-semibold text-primary">{money(summary.outstanding)}</dd></dl>
    <div className={`${expenseCard} col-span-2 ${compact ? "" : "lg:col-span-1"}`}><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">Budget used</p><p className="text-sm font-semibold text-primary">{summary.utilization === null ? "Unavailable" : `${summary.utilization}%`}</p></div>
      {summary.utilization !== null ? <div role="progressbar" aria-label="Budget utilization" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, summary.utilization)} aria-valuetext={`${summary.utilization}% of budget used`} className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-primary-container" style={{ width: `${Math.min(100, summary.utilization)}%` }} /></div> : <p className="mt-3 text-xs text-secondary">{summary.totalBudget === null ? "Set a budget to track utilization." : "Utilization is unavailable for a ₹0 budget."}</p>}
      {summary.utilization !== null && <p className="mt-3 text-xs text-secondary">{money(summary.totalExpenses)} expenses of {money(summary.totalBudget!)} budget</p>}
    </div></div>
  </section>;
}
export function ExpenseSkeleton({ label }: { label: string }) { return <div role="status" aria-label={label} aria-busy="true" className={expenseCard}><span className="sr-only">{label}…</span><div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse"><div className="h-6 w-1/2 rounded bg-surface-container" /><div className="h-32 rounded-xl bg-surface-container-low" /><div className="h-24 rounded-xl bg-surface-container-low" /></div></div>; }
