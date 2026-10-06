"use client";
import { primaryAction } from "@/components/tasks/task-ui";
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div role="alert" className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm"><h2 className="font-display-md text-3xl text-primary">Unable to load tasks</h2><p className="mt-3 text-on-surface-variant">Please try again to load your shared wedding checklist.</p><button type="button" className={`${primaryAction} mt-6`} onClick={retry}>Retry</button></div>;
}
