"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { expenseCategories, money, paymentStatus, roundedMoney } from "@/features/expenses/format";
import { validMoney } from "@/features/expenses/requests";
import type { ExpenseEvent, WeddingExpense } from "@/features/expenses/types";
import type { ApiResponse } from "@/types/api";
import { expenseCard, expenseInput, PaymentBadge, primaryAction, secondaryAction } from "./expense-ui";

type Fields = { name: string; category: string; amount: string; paidAmount: string; eventId: string; paidByName: string; notes: string };
export function ExpenseForm({ expense, events }: { expense?: WeddingExpense; events: ExpenseEvent[] }) {
  const router = useRouter(), form = useRef<HTMLFormElement>(null), pending = useRef(false);
  const [values, setValues] = useState<Fields>({ name: expense?.name ?? "", category: expense?.category ?? "", amount: expense ? String(expense.amount) : "", paidAmount: String(expense?.paidAmount ?? 0), eventId: expense?.eventId ?? "", paidByName: expense?.paidByName ?? "", notes: expense?.notes ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [saving, setSaving] = useState(false), [failure, setFailure] = useState("");
  const amount = Number(values.amount), paid = Number(values.paidAmount);
  const amountsValid = values.amount.trim() !== "" && validMoney(amount, true) && values.paidAmount.trim() !== "" && validMoney(paid) && paid <= amount;
  function change(key: keyof Fields, value: string) { setValues(old => ({ ...old, [key]: value })); setErrors(old => ({ ...old, [key]: undefined })); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    const invalid: typeof errors = {};
    if (!values.name.trim() || values.name.trim().length > 120) invalid.name = "Enter an expense name (up to 120 characters).";
    if (!values.category.trim() || values.category.trim().length > 80) invalid.category = "Choose or enter a category (up to 80 characters).";
    if (!values.amount.trim() || !validMoney(amount, true)) invalid.amount = "Enter an amount greater than zero, with at most two decimal places.";
    if (!values.paidAmount.trim() || !validMoney(paid) || paid > amount) invalid.paidAmount = "Paid amount must be between zero and the total expense amount.";
    if (values.paidByName.trim().length > 120) invalid.paidByName = "Keep the payer name within 120 characters.";
    if (values.notes.trim().length > 5000) invalid.notes = "Keep notes within 5000 characters.";
    setErrors(invalid); setFailure("");
    if (Object.keys(invalid).length) { form.current?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)?.focus(); return; }
    pending.current = true; setSaving(true); let saved = false;
    try {
      const response = await fetch(expense ? `/api/v1/expenses/${expense.id}` : "/api/v1/expenses", { method: expense ? "PUT" : "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, amount, paidAmount: paid, eventId: values.eventId || null }) });
      const result = await response.json() as ApiResponse<WeddingExpense>;
      if (!response.ok || !result.success) { setFailure(!result.success && result.error?.details?.length ? result.error.details.join(" ") : result.message || "Could not save this expense. Please try again."); return; }
      saved = true; router.push(`/budget/expenses/${result.data.id}?saved=${expense ? "updated" : "created"}`); router.refresh();
    } catch { setFailure("Could not save this expense. Check your connection and try again. Your details are still here."); }
    finally { if (!saved) { pending.current = false; setSaving(false); } }
  }
  function field(key: Exclude<keyof Fields, "notes" | "eventId">, label: string, required = false, numeric = false) {
    return <div className="min-w-0 space-y-2"><label htmlFor={`expense-${key}`} className="text-sm font-semibold">{label} {required ? <span aria-hidden="true" className="text-error">*</span> : <span className="font-normal text-secondary">(optional)</span>}</label>
      <input id={`expense-${key}`} name={key} value={values[key]} onChange={e => change(key, e.target.value)} type={numeric ? "number" : "text"} min={numeric ? 0 : undefined} step={numeric ? "0.01" : undefined} inputMode={numeric ? "decimal" : undefined} required={required} maxLength={numeric ? undefined : key === "category" ? 80 : 120} list={key === "category" ? "expense-categories" : undefined} className={expenseInput} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />
      {errors[key] && <p id={`${key}-error`} className="text-xs text-error">{errors[key]}</p>}</div>;
  }
  return <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"><form ref={form} onSubmit={submit} noValidate aria-busy={saving} className={`${expenseCard} space-y-6`}>
    {failure && <p role="alert" className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure}</p>}
    {Object.values(errors).some(Boolean) && <p role="alert" className="text-sm text-error">Please check the highlighted details before saving.</p>}
    <fieldset disabled={saving} className="min-w-0 space-y-6 disabled:opacity-70">
      {field("name", "Expense name", true)}
      <div className="grid gap-5 sm:grid-cols-2"><div>{field("category", "Category", true)}<datalist id="expense-categories">{expenseCategories.map(category => <option key={category} value={category} />)}</datalist><p className="mt-2 text-xs text-secondary">Choose a suggested category or type your own.</p></div>
        <div className="space-y-2"><label htmlFor="expense-event" className="text-sm font-semibold">Related event <span className="font-normal text-secondary">(optional)</span></label><select id="expense-event" name="eventId" value={values.eventId} onChange={e => change("eventId", e.target.value)} className={expenseInput}><option value="">Wedding-wide</option>{events.map(event => <option value={event.id} key={event.id}>{event.name}</option>)}</select>{events.length === 0 && <p className="text-xs text-secondary">No events yet. This expense will stay wedding-wide.</p>}</div></div>
      <div className="space-y-4 rounded-xl bg-surface-container-low p-4"><p className="text-[11px] font-semibold uppercase tracking-widest text-secondary">Payment details · Indian Rupee (₹)</p><div className="grid gap-5 sm:grid-cols-2">{field("amount", "Total amount (₹)", true, true)}{field("paidAmount", "Paid amount (₹)", true, true)}</div><p className="text-xs text-secondary">Payment status and outstanding amount are calculated automatically.</p></div>
      {field("paidByName", "Paid by")}
      <div className="space-y-2"><label htmlFor="expense-notes" className="text-sm font-semibold">Notes <span className="font-normal text-secondary">(optional)</span></label><textarea id="expense-notes" name="notes" rows={4} maxLength={5000} value={values.notes} onChange={e => change("notes", e.target.value)} className={expenseInput} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} />{errors.notes && <p id="notes-error" className="text-xs text-error">{errors.notes}</p>}</div>
    </fieldset>
    <div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant/30 pt-5">{saving ? <span className={`${secondaryAction} opacity-50`}>Cancel</span> : <Link href={expense ? `/budget/expenses/${expense.id}` : "/budget"} className={secondaryAction}>Cancel</Link>}<button type="submit" disabled={saving} className={`${primaryAction} disabled:opacity-60`}>{saving ? "Saving…" : expense ? "Save changes" : "Add expense"}</button></div>
  </form><aside aria-label="Payment preview" className={`${expenseCard} space-y-5`}><h2 className="text-sm font-semibold uppercase tracking-wide text-secondary">Payment summary</h2>{amountsValid ? <><PaymentBadge status={paymentStatus(amount, paid)} /><dl className="space-y-5 rounded-xl bg-surface-container-low p-5"><div><dt className="text-xs text-secondary">Outstanding amount</dt><dd className="mt-2 break-words font-display-md text-3xl text-primary">{money(roundedMoney(amount - paid))}</dd></div><div><dt className="text-xs text-secondary">Total amount</dt><dd className="mt-1 font-semibold">{money(amount)}</dd></div><div><dt className="text-xs text-secondary">Paid amount</dt><dd className="mt-1 font-semibold">{money(paid)}</dd></div></dl></> : <p className="text-sm leading-relaxed text-secondary">Enter valid total and paid amounts to see the payment summary.</p>}<p className="text-xs leading-relaxed text-secondary">This records your wedding costs and payments. No payment is processed here.</p></aside></div>;
}
