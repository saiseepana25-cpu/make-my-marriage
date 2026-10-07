import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getPageExpense } from "@/features/expenses/page-data";
import { expenseTimestamp, money } from "@/features/expenses/format";
import { eventDate, eventTiming } from "@/features/events/dates";
import { BackToBudget, expenseCard, PaymentBadge, primaryAction } from "@/components/expenses/expense-ui";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
export const metadata: Metadata = { title: "Expense details", robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ expenseId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requirePageUser();
  const [{ expense, event }, search] = await Promise.all([getPageExpense((await params).expenseId), searchParams]);
  const manage = hasPermission(user.role, "expenses:manage");
  return <div className="mx-auto max-w-5xl space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><BackToBudget />{manage && <div className="flex flex-wrap gap-3"><DeleteExpenseButton expense={expense} /><Link href={`/budget/expenses/${expense.id}/edit`} className={primaryAction}>Edit expense</Link></div>}</div>
    {(search.saved === "created" || search.saved === "updated") && <p role="status" className="rounded-xl bg-secondary-container p-4 text-sm">Expense {search.saved === "created" ? "created" : "updated"} successfully.</p>}
    <article className={expenseCard}><div className="flex flex-wrap gap-3"><PaymentBadge status={expense.paymentStatus} /><span className="rounded-full bg-surface-container-low px-3 py-1 text-xs text-secondary">{expense.category}</span></div><h1 className="mt-5 break-words font-display-md text-3xl text-primary sm:text-4xl">{expense.name}</h1>
      <dl className="mt-7 grid gap-4 sm:grid-cols-3">{[["Total expense amount", expense.amount], ["Paid amount", expense.paidAmount], ["Outstanding amount", expense.outstanding]].map(([label, amount]) => <div key={label} className="min-w-0 rounded-xl bg-surface-container-low p-5"><dt className="text-xs text-secondary">{label}</dt><dd className="mt-3 break-words font-display-md text-2xl text-primary">{money(Number(amount))}</dd></div>)}</dl>
      <dl className="mt-7 grid gap-5 sm:grid-cols-2"><div className="rounded-xl bg-surface-container-low p-5"><dt className="text-xs text-secondary">Related event</dt><dd className="mt-2 break-words text-sm font-semibold">{event ? <Link href={`/events/${event.id}`} className="text-primary underline">{event.name}</Link> : "Wedding-wide"}</dd>{event && <dd className="mt-3 space-y-2 text-xs text-secondary"><p>{eventDate(event.startAt)} · {eventTiming(event)}</p><p className="break-words">{event.venue}</p></dd>}</div><div className="rounded-xl bg-surface-container-low p-5"><dt className="text-xs text-secondary">Paid by</dt><dd className="mt-2 break-words text-sm font-semibold">{expense.paidByName || "Not specified"}</dd></div></dl>
      <section className="mt-7"><h2 className="font-display-md text-2xl text-primary">Notes</h2><p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-surface-container-low p-5 text-sm leading-relaxed text-secondary">{expense.notes || "No notes added."}</p></section>
      <dl className="mt-7 grid gap-4 border-t border-outline-variant/30 pt-5 text-xs text-secondary sm:grid-cols-2"><div><dt>Created (IST)</dt><dd className="mt-1">{expenseTimestamp(expense.createdAt)} IST</dd></div><div><dt>Last updated (IST)</dt><dd className="mt-1">{expenseTimestamp(expense.updatedAt)} IST</dd></div></dl>
    </article>{!manage && <p className="text-sm text-secondary">View-only access. The owner and admins manage wedding expenses.</p>}</div>;
}
