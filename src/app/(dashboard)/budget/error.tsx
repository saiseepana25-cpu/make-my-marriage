"use client";
import { primaryAction } from "@/components/expenses/expense-ui";
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div role="alert" className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm"><h2 className="font-display-md text-3xl text-primary">Unable to load budget &amp; expenses</h2><p className="mt-3 text-secondary">Please try again to load your saved wedding finances.</p><button type="button" className={`${primaryAction} mt-6`} onClick={retry}>Retry</button></div>;
}
