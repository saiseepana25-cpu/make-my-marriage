import { FutureModules, SectionSkeleton, dashboardCard } from "@/components/dashboard/dashboard-ui";

export default function Loading() {
  return <div className="space-y-8">
    <div role="status" aria-label="Loading wedding overview" className={`${dashboardCard} motion-safe:animate-pulse`}><span className="sr-only">Loading your wedding overview…</span><div aria-hidden="true" className="space-y-4"><div className="h-8 w-2/3 rounded bg-surface-container" /><div className="h-4 w-1/2 rounded bg-surface-container-low" /><div className="h-16 rounded-xl bg-surface-container-low" /></div></div>
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"><div className="space-y-8"><SectionSkeleton kind="tasks" /><SectionSkeleton kind="events" /></div><FutureModules /></div>
  </div>;
}
