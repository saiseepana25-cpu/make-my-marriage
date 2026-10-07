"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { WeddingExpense } from "@/features/expenses/types";
import { money } from "@/features/expenses/format";
import type { ApiResponse } from "@/types/api";
import { secondaryAction } from "./expense-ui";
export function DeleteExpenseButton({ expense }: { expense: WeddingExpense }) {
  const dialog = useRef<HTMLDialogElement>(null), cancel = useRef<HTMLButtonElement>(null), trigger = useRef<HTMLButtonElement>(null), pending = useRef(false);
  const [saving, setSaving] = useState(false), [failure, setFailure] = useState(""); const router = useRouter();
  async function remove() {
    if (pending.current) return; pending.current = true; setSaving(true); setFailure(""); let deleted = false;
    try {
      const response = await fetch(`/api/v1/expenses/${expense.id}`, { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) { const result = await response.json() as ApiResponse<never>; setFailure(result.message || "Could not delete this expense. Please try again."); return; }
      deleted = true; dialog.current?.close(); router.push("/budget?deleted=1"); router.refresh();
    } catch { setFailure("Could not delete this expense. Check your connection and try again."); }
    finally { if (!deleted) { pending.current = false; setSaving(false); } }
  }
  return <><button ref={trigger} type="button" className={`${secondaryAction} text-error`} onClick={() => { setFailure(""); dialog.current?.showModal(); cancel.current?.focus(); }}>Delete expense</button>
    <dialog ref={dialog} aria-labelledby="delete-expense-title" aria-describedby="delete-expense-description" onCancel={e => { if (pending.current) e.preventDefault(); }} onClose={() => trigger.current?.focus()} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-on-surface/40 sm:p-8">
      <h2 id="delete-expense-title" className="font-display-md text-3xl text-primary">Delete this expense?</h2><div className="mt-5 rounded-xl bg-surface-container-low p-4"><p className="break-words font-semibold">{expense.name}</p><p className="mt-2 text-sm text-secondary">Total {money(expense.amount)} · Paid {money(expense.paidAmount)}</p></div>
      <p id="delete-expense-description" className="mt-5 text-sm leading-relaxed text-secondary">This permanently removes the expense and its recorded paid amount from your totals. Your wedding budget, related event and other expenses will stay. This cannot be undone.</p>
      {failure && <p role="alert" className="mt-4 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{failure}</p>}
      <div className="mt-7 flex flex-wrap justify-end gap-3"><button ref={cancel} type="button" disabled={saving} onClick={() => { if (!pending.current) dialog.current?.close(); }} className={secondaryAction}>Cancel</button><button type="button" disabled={saving} onClick={remove} className="min-h-11 rounded-full bg-error px-5 py-2.5 text-sm font-semibold text-on-error disabled:opacity-60">{saving ? "Deleting…" : "Delete expense permanently"}</button></div>
    </dialog></>;
}
