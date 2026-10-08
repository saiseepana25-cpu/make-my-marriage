import Link from "next/link";
import { Icon } from "@/components/marketing/icon";
import { attendanceLabels, guestInitials, guestNotice } from "@/features/guests/format";
import type { GuestSummary } from "@/features/guests/types";
import type { RsvpStatus } from "@/types/domain";
export { primaryAction, secondaryAction } from "@/components/tasks/task-ui";
export const guestCard = "min-w-0 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm sm:p-7";
export const guestInput = "w-full min-w-0 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 text-base focus:border-primary sm:text-sm";
export function BackToGuests() { return <Link href="/guests" className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary hover:text-primary"><Icon name="arrow_back" />Back to guests</Link>; }
export function GuestNotice() { return <p className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-sm leading-relaxed text-secondary"><Icon name="pending" className="mt-0.5 text-xl text-primary" />{guestNotice}</p>; }
export function GuestReadOnly() { return <p className="rounded-xl bg-surface-container-lowest p-4 text-sm text-secondary">View-only access. You can view guest details; the owner and admins manage the guest list.</p>; }
export function GuestAvatar({ name, large = false }: { name: string; large?: boolean }) { return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${large ? "size-16 bg-primary font-display-md text-xl text-on-primary" : "size-10 bg-primary-fixed/60 text-sm text-primary"}`}>{guestInitials(name)}</span>; }
export function AttendanceBadge({ status }: { status: RsvpStatus }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status === "ATTENDING" ? "bg-primary-fixed/60 text-primary" : "bg-surface-container text-on-surface-variant"}`}><Icon name={status === "NOT_ATTENDING" ? "close" : "radio_button_unchecked"} />{attendanceLabels[status]}</span>; }
export function GuestMetrics({ summary, compact = false }: { summary: GuestSummary; compact?: boolean }) {
  const metrics = [
    { label: "Total guest records", value: summary.total, help: "All recorded guests", icon: "group" },
    { label: "Pending", value: summary.pending, help: "Pending confirmation", icon: "schedule" },
    { label: "Attending", value: summary.attending, help: "Confirmed attending", icon: "check_circle" },
    { label: "Not attending", value: summary.notAttending, help: "Marked not attending", icon: "cancel" },
  ] as const;
  return <dl aria-label="Guest record totals" className={`grid grid-cols-2 gap-4 ${compact ? "" : "xl:grid-cols-4"}`}>{metrics.map(metric => <div key={metric.label} className={compact ? "min-w-0 rounded-xl bg-surface-container-low p-4" : guestCard}><dt className="flex items-start justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-secondary"><span>{metric.label}</span><Icon name={metric.icon} className="text-xl text-primary" /></dt><dd className="mt-5 font-display-md text-3xl text-primary sm:text-4xl">{metric.value}</dd>{!compact && <><p className="mt-2 text-xs text-secondary">{metric.help}</p><div aria-hidden="true" className="mt-5 h-1 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-primary-container" style={{ width: `${summary.total ? metric.value / summary.total * 100 : 0}%` }} /></div></>}</div>)}</dl>;
}
export function GuestSkeleton({ label }: { label: string }) { return <div role="status" aria-label={label} aria-busy="true" className={guestCard}><span className="sr-only">{label}…</span><div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse"><div className="h-6 w-1/2 rounded bg-surface-container" /><div className="h-24 rounded-xl bg-surface-container-low" /><div className="h-24 rounded-xl bg-surface-container-low" /></div></div>; }
