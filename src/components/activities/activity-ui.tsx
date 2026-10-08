import Link from "next/link";
import { Icon } from "@/components/marketing/icon";
import { activityNotice, activityTimestamp } from "@/features/activities/format";
import type { WeddingActivity } from "@/features/activities/types";
import type { ActivitySource } from "@/types/domain";
export { primaryAction, secondaryAction } from "@/components/tasks/task-ui";
export const activityCard = "min-w-0 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm sm:p-7";
export const activityInput = "w-full min-w-0 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 text-base focus:border-primary sm:text-sm";
export function BackToActivities() { return <Link href="/activities" className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary hover:text-primary"><Icon name="arrow_back" />Back to activities</Link>; }
export function ActivityNotice() { return <p className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-sm leading-relaxed text-secondary"><Icon name="shield" className="mt-0.5 text-xl text-primary" />{activityNotice}</p>; }
export function SourceBadge({ source }: { source: ActivitySource }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${source === "MANUAL" ? "bg-primary-fixed/60 text-primary" : "bg-surface-container text-secondary"}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{source === "MANUAL" ? "Manual update" : "Automatic update"}</span>; }
export function ActivityIcon({ activity }: { activity: Pick<WeddingActivity, "sourceType" | "activityType"> }) {
  const icon = activity.sourceType === "MANUAL" ? "chat" : activity.activityType === "Events" ? "calendar_month" : activity.activityType === "Tasks" ? "check_circle" : activity.activityType === "Expenses" ? "account_balance_wallet" : activity.activityType === "Guests" ? "group" : "history_edu";
  return <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-full text-xl ${activity.sourceType === "MANUAL" ? "bg-primary-fixed/60 text-primary" : "bg-surface-container text-secondary"}`}><Icon name={icon} /></span>;
}
export function ActivityItem({ activity, compact = false }: { activity: WeddingActivity; compact?: boolean }) {
  return <article className={compact ? "min-w-0 border-b border-outline-variant/20 py-5 last:border-b-0" : activityCard}>
    <div className="flex min-w-0 items-start gap-3 sm:gap-4"><ActivityIcon activity={activity} /><div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2"><h3 className={`w-full min-w-0 max-w-full break-words font-semibold ${compact ? "text-sm" : "text-lg sm:w-auto"}`}><Link href={`/activities/${activity.id}`} className="hover:text-primary">{activity.title}</Link></h3><SourceBadge source={activity.sourceType} />{activity.activityType && <span className="max-w-full break-words rounded-full bg-surface-container px-3 py-1 text-xs text-secondary">Category: {activity.activityType}</span>}</div>
      {!compact && <p className="mt-3 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary">{activity.description || "No description provided."}</p>}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-secondary"><span className="break-words">Author: {activity.authorName}</span><time dateTime={activity.createdAt}>{activityTimestamp(activity.createdAt)}</time><span className="break-words">Related: {activity.event ? <Link href={`/events/${activity.event.id}`} className="text-primary underline">{activity.event.name}</Link> : "Wedding-wide"}</span></div>
      <Link href={`/activities/${activity.id}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary">View details<Icon name="arrow_forward" /><span className="sr-only"> for {activity.title}</span></Link>
    </div></div>
  </article>;
}
export function ActivitySkeleton({ label = "Loading activities" }: { label?: string }) {
  return <div role="status" aria-label={label} aria-busy="true" className={activityCard}><span className="sr-only">{label}…</span><div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">{[0, 1, 2].map(key => <div key={key} className="space-y-3 rounded-xl bg-surface-container-low p-4"><div className="h-5 w-3/5 rounded bg-surface-container" /><div className="h-3 w-4/5 rounded bg-surface-container" /><div className="h-3 w-2/5 rounded bg-surface-container" /></div>)}</div></div>;
}
