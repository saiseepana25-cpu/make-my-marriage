"use client";
import { dashboardCard } from "@/components/dashboard/dashboard-ui";
import { primaryAction } from "@/components/tasks/task-ui";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <section role="alert" className={dashboardCard}><h1 className="text-2xl font-semibold text-primary">Couldn’t load your wedding overview</h1><p className="mt-3 text-on-surface-variant">Please try again in a moment.</p><button type="button" onClick={retry} className={`${primaryAction} mt-5`}>Retry dashboard</button></section>;
}
