"use client";
import Link from "next/link";
import type { GuestSummary } from "@/features/guests/types";
import { useGuestData } from "@/components/guests/use-guest-data";
import { GuestFailure } from "@/components/guests/guest-overview";
import { GuestMetrics, GuestSkeleton, primaryAction } from "@/components/guests/guest-ui";
import { dashboardCard } from "./dashboard-ui";
export function DashboardGuests({ manage }: { manage: boolean }) {
  const { state, reload } = useGuestData<GuestSummary>("/api/v1/dashboard?section=guests");
  if (state.status === "loading") return <GuestSkeleton label="Loading dashboard guests" />;
  if (state.status === "error") return <GuestFailure label="dashboard guests" expired={state.expired} retry={reload} />;
  return <section className={dashboardCard} aria-labelledby="dashboard-guests-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="dashboard-guests-title" className="text-lg font-semibold">Guests &amp; Attendance</h2><Link href="/guests" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">View guests →</Link></div><div className="mt-5"><GuestMetrics summary={state.data} compact /></div>{!state.data.total && <p className="mt-4 text-sm text-secondary">Your guest list starts here. Add your first guest to track attendance.</p>}{manage && <Link href="/guests/new" className={`${primaryAction} mt-5`}>Add guest</Link>}<p className="mt-4 text-xs leading-relaxed text-secondary">Attendance is updated by your family. Guest self-service RSVP and invitation sending are coming soon.</p></section>;
}
