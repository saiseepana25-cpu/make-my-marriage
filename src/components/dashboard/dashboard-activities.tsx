"use client";
import Link from "next/link";
import type { WeddingActivity } from "@/features/activities/types";
import { useActivityData } from "@/components/activities/use-activity-data";
import { ActivityFailure } from "@/components/activities/activity-failure";
import { ActivityItem, ActivitySkeleton, primaryAction } from "@/components/activities/activity-ui";
import { dashboardCard } from "./dashboard-ui";
export function DashboardActivities() {
  const { state, reload } = useActivityData<{ activities: WeddingActivity[]; asOf: number }>("/api/v1/dashboard?section=activities");
  if (state.status === "loading") return <ActivitySkeleton label="Loading recent activity" />;
  if (state.status === "error") return <ActivityFailure label="recent activity" expired={state.expired} retry={reload} />;
  return <section className={dashboardCard} aria-labelledby="dashboard-activities-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="dashboard-activities-title" className="text-lg font-semibold">Recent Activity</h2><Link href="/activities" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">View all updates →</Link></div>{state.data.activities.length ? <div className="mt-3">{state.data.activities.map(activity => <ActivityItem key={activity.id} activity={activity} compact />)}</div> : <div className="mt-5 rounded-xl bg-surface-container-low p-5"><h3 className="font-semibold text-primary">No activity yet</h3><p className="mt-3 text-sm leading-relaxed text-secondary">Share your first update or continue planning to see new activity here.</p></div>}<Link href="/activities/new" className={`${primaryAction} mt-5`}>Add update</Link><p className="mt-4 text-xs leading-relaxed text-secondary">Manual and automatic updates from your private wedding workspace.</p></section>;
}
