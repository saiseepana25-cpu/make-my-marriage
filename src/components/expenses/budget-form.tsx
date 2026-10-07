"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validMoney } from "@/features/expenses/requests";
import { money } from "@/features/expenses/format";
import type { BudgetSummary } from "@/features/expenses/types";
import type { ApiResponse } from "@/types/api";
import { expenseCard, expenseInput, primaryAction, secondaryAction } from "./expense-ui";
export function BudgetForm({ summary }: { summary: BudgetSummary }) {
  const [value, setValue] = useState(summary.totalBudget === null ? "" : String(summary.totalBudget));
  const [error, setError] = useState(""), [failure, setFailure] = useState(""), [saving, setSaving] = useState(false);
  const pending = useRef(false), input = useRef<HTMLInputElement>(null), router = useRouter();
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    const totalBudget = Number(value); setFailure("");
    if (!value.trim() || !validMoney(totalBudget)) { setError("Enter a budget of zero or more, with at most two decimal places."); input.current?.focus(); return; }
    setError(""); pending.current = true; setSaving(true); let saved = false;
    try {
      const response = await fetch("/api/v1/budget", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalBudget }) });
      const result = await response.json() as ApiResponse<{ totalBudget: number }>;
      if (!response.ok || !result.success) { setFailure(!result.success && result.error?.details?.length ? result.error.details.join(" ") : result.message || "Could not save your budget. Please try again."); return; }
      saved = true; router.push("/budget?saved=budget"); router.refresh();
    } catch { setFailure("Could not save your budget. Check your connection and try again. Your amount is still here."); }
    finally { if (!saved) { pending.current = false; setSaving(false); } }
  }
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"><form noValidate onSubmit={submit} aria-busy={saving} className={`${expenseCard} space-y-6`}>
    {failure && <p role="alert" className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure}</p>}
    <p className="text-sm leading-relaxed text-secondary">Set one overall budget for your wedding. You can revise it as your plans take shape.</p>
    <div className="space-y-3"><label htmlFor="total-budget" className="text-sm font-semibold">Total wedding budget (₹)</label><input ref={input} id="total-budget" value={value} type="number" min="0" step="0.01" inputMode="decimal" disabled={saving} onChange={e => { setValue(e.target.value); setError(""); }} className={expenseInput} aria-invalid={!!error} aria-describedby="budget-help budget-error" /><p id="budget-help" className="text-xs text-secondary">Saving ₹0 is allowed and is different from leaving the budget unset.</p>{error && <p id="budget-error" role="alert" className="text-sm text-error">{error}</p>}</div>
    <p className="rounded-xl bg-surface-container-low p-4 text-sm text-secondary">Changing your budget preserves all saved expenses and paid amounts.</p>
    <div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant/30 pt-5">{saving ? <span className={`${secondaryAction} opacity-50`}>Cancel</span> : <Link href="/budget" className={secondaryAction}>Cancel</Link>}<button type="submit" disabled={saving} className={`${primaryAction} disabled:opacity-60`}>{saving ? "Saving…" : "Save budget"}</button></div>
  </form><aside className={`${expenseCard} space-y-4`}><h2 className="text-lg font-semibold">Your current expenses</h2><dl className="space-y-4">{[["Total expenses", summary.totalExpenses], ["Total paid", summary.totalPaid], ["Outstanding payments", summary.outstanding]].map(([label, amount]) => <div key={label}><dt className="text-xs text-secondary">{label}</dt><dd className="mt-1 break-words text-xl font-semibold text-primary">{money(Number(amount))}</dd></div>)}</dl></aside></div>;
}
