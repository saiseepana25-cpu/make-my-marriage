"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/marketing/icon";
import { TaskStatusControl } from "@/components/tasks/task-status-control";
import { OverdueBadge, PriorityBadge, StatusBadge, primaryAction, secondaryAction, taskIdeas } from "@/components/tasks/task-ui";
import { completionPercentage } from "@/features/dashboard/format";
import type { DashboardEvents, DashboardTasks } from "@/features/dashboard/types";
import { eventDate, eventTime } from "@/features/events/dates";
import { deadlineLabel, isOverdue } from "@/features/tasks/format";
import type { ApiResponse } from "@/types/api";
import { dashboardCard, SectionSkeleton } from "./dashboard-ui";

type LoadState<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; expired: boolean };
async function fetchSection<T>(kind: "tasks" | "events", signal: AbortSignal): Promise<LoadState<T>> {
  try {
    const response = await fetch(`/api/v1/dashboard?section=${kind}`, { credentials: "same-origin", cache: "no-store", signal });
    const result = await response.json() as ApiResponse<T>;
    return response.ok && result.success ? { status: "ready", data: result.data } : { status: "error", expired: response.status === 401 };
  } catch { return { status: "error", expired: false }; }
}
function useDashboardSection<T>(kind: "tasks" | "events") {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const current = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    current.current?.abort();
    const controller = new AbortController(); current.current = controller;
    void fetchSection<T>(kind, controller.signal).then(next => {
      if (!controller.signal.aborted) setState(next);
    });
  }, [kind]);
  const reload = useCallback(() => { setState({ status: "loading" }); void load(); }, [load]);
  useEffect(() => { void load(); return () => current.current?.abort(); }, [load]);
  return { state, reload };
}

function SectionFailure({ kind, expired, retry }: { kind: "tasks" | "events"; expired: boolean; retry: () => void }) {
  return <section className={dashboardCard} aria-label={`${kind === "tasks" ? "Tasks" : "Events"} loading error`}>
    <div role="alert" className="rounded-xl bg-surface-container-low px-5 py-8 text-center">
      <Icon name="warning" className="text-3xl text-primary-container" />
      <h2 className="mt-3 text-xl font-semibold">Couldn’t load {kind}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">{expired ? "Your session has expired. Please log in again." : `Your ${kind} are still saved. Please try again in a moment.`}</p>
      {expired ? <Link href="/login" className={`${primaryAction} mt-5`}>Log in</Link> : <button type="button" onClick={retry} className={`${primaryAction} mt-5`}>Retry {kind}</button>}
    </div>
  </section>;
}

export function DashboardTasksSection({ canAdd }: { canAdd: boolean }) {
  const { state, reload } = useDashboardSection<DashboardTasks>("tasks");
  const [taskFailures, setTaskFailures] = useState<Record<string, string>>({});
  if (state.status === "loading") return <SectionSkeleton kind="tasks" />;
  if (state.status === "error") return <SectionFailure kind="tasks" expired={state.expired} retry={() => void reload()} />;
  const { counts, attention, attentionTotal, asOf } = state.data;
  const percent = completionPercentage(counts.completed, counts.total);
  return <div className="space-y-6 sm:space-y-8">
    <section aria-labelledby="task-progress-title" className={dashboardCard}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="task-progress-title" className="text-xl font-semibold sm:text-[22px]">Task progress</h2><p className="mt-1 text-xs text-secondary sm:text-sm">A little progress, one task at a time.</p></div>
        <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant">{counts.total ? `${percent}% completed` : "No tasks yet"}</span>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[{ label: "Total tasks", value: counts.total }, { label: "Completed", value: counts.completed }, { label: "Unfinished", value: counts.unfinished }, { label: "Overdue", value: counts.overdue }].map((metric, index) =>
          <div key={metric.label} className="rounded-xl bg-surface-container-low p-3 sm:p-4"><dt className={`text-[10px] font-semibold uppercase tracking-wider ${index === 3 ? "text-error" : "text-secondary"}`}>{metric.label}</dt><dd className={`mt-2 text-[28px] font-bold ${index === 3 ? "text-error" : index === 1 ? "text-primary" : "text-on-surface"}`}>{metric.value}</dd></div>)}
      </dl>
      <p className="mt-4 text-xs text-secondary">{counts.total ? `${counts.completed} of ${counts.total} tasks completed. Overdue tasks are included in unfinished.` : "Create your first task to start tracking progress."}</p>
      <div role="progressbar" aria-label="Task completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={counts.total ? `${counts.completed} of ${counts.total} tasks completed` : "No tasks yet"} className="mt-3 h-3 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-primary-container" style={{ width: `${percent}%` }} /></div>
    </section>
    <section aria-labelledby="attention-title" className={dashboardCard}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="attention-title" className="text-xl font-semibold sm:text-[22px]">Tasks Needing Attention</h2><p className="mt-1 text-xs text-secondary sm:text-sm">Overdue or due within the next 7 days.</p></div><Link href="/tasks" className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary">View all tasks ({counts.total})<Icon name="arrow_forward" /></Link></div>
      {attention.length ? <><ul className="mt-5 space-y-3.5">{attention.map(task => <li key={task.id} className="flex flex-wrap items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/70 p-4">
        {task.canComplete ? <TaskStatusControl id={task.id} title={task.title} status={task.status} compact onUpdated={() => void reload()} onError={message => setTaskFailures(previous => ({ ...previous, [task.id]: message }))} /> : <Icon name="radio_button_unchecked" className="mt-1 text-lg text-secondary" />}
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={`/tasks/${task.id}`} className="break-words text-sm font-semibold hover:text-primary sm:text-base">{task.title}</Link>
          {isOverdue(task, asOf) ? <OverdueBadge /> : <span className="rounded-full bg-surface-container-highest px-2.5 py-1 text-xs text-on-surface-variant">Due soon</span>}</div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-secondary">
            {task.event ? <Link href={`/events/${task.event.id}`} className="inline-flex min-w-0 items-center gap-1 hover:text-primary"><Icon name="calendar_month" /><span className="break-words">{task.event.name}</span></Link> : <span>Wedding-wide</span>}
            <span className={`inline-flex items-start gap-1 ${isOverdue(task, asOf) ? "text-error" : ""}`}><Icon name="schedule" className="mt-0.5" />{deadlineLabel(task.dueAt)}</span>
            <StatusBadge status={task.status} /><span className="inline-flex items-center gap-1">Priority: <PriorityBadge priority={task.priority} /></span>
          </div>
        </div>
        {taskFailures[task.id] && <p role="alert" className="w-full rounded-lg bg-error-container/40 px-3 py-2 text-xs text-on-error-container">{taskFailures[task.id]}</p>}
      </li>)}</ul>{attentionTotal > attention.length && <p className="mt-4 text-xs text-secondary">Showing {attention.length} of {attentionTotal} tasks needing attention. <Link href="/tasks" className="font-semibold text-primary underline">Open your checklist</Link> to see all tasks.</p>}</>
        : <div className="mt-5 rounded-xl bg-surface-container-low px-4 py-8 text-center"><Icon name="checklist" className="text-4xl text-primary-container" /><h3 className="mt-3 text-lg font-semibold">{counts.total ? "No tasks needing attention" : "Your wedding checklist starts here"}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">{counts.total ? "You have no overdue tasks or unfinished deadlines in the next 7 days. Keep your plans moving at your own pace." : "Start with one small task. Your family’s plans will come together here."}</p>
          {canAdd && <Link href="/tasks/new" className={`${primaryAction} mt-5`}><Icon name="add" />{counts.total ? "Add task" : "Add your first task"}</Link>}
        </div>}
      {!counts.total && canAdd && <div className="mt-5"><p className="text-xs font-semibold text-secondary">A few ideas to get started</p><div className="mt-3 flex flex-wrap gap-2">{taskIdeas.map(title => <Link key={title} href={`/tasks/new?title=${encodeURIComponent(title)}`} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant"><Icon name="add" />{title}</Link>)}</div></div>}
    </section>
  </div>;
}

export function DashboardEventsSection({ canAdd }: { canAdd: boolean }) {
  const { state, reload } = useDashboardSection<DashboardEvents>("events");
  if (state.status === "loading") return <SectionSkeleton kind="events" />;
  if (state.status === "error") return <SectionFailure kind="events" expired={state.expired} retry={() => void reload()} />;
  const { events, total, upcoming, asOf } = state.data;
  return <section aria-labelledby="upcoming-events-title" className={dashboardCard}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 id="upcoming-events-title" className="text-xl font-semibold sm:text-[22px]">Upcoming Events &amp; Ceremony Timeline</h2><p className="mt-1 text-xs text-secondary sm:text-sm">Your celebrations, in chronological order.</p></div>
      <div className="flex flex-wrap gap-4">{canAdd && <Link href="/events/new" className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary"><Icon name="add" />Add event</Link>}<Link href="/events" className="inline-flex min-h-11 items-center text-xs font-semibold text-secondary">View all events</Link></div>
    </div>
    {events.length ? <><ol className="mt-5 space-y-4">{events.map((event, index) => <li key={event.id} className="flex flex-col justify-between gap-4 rounded-xl bg-surface-container-low/70 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-start gap-3"><span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xl ${index === 0 ? "bg-primary-fixed/60 text-primary" : "bg-secondary-container text-secondary"}`}><Icon name="calendar_month" /></span>
        <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{new Date(event.startAt).getTime() <= asOf ? "Happening now" : `Celebration ${String(index + 1).padStart(2, "0")}`}</p>
          <h3 className="mt-1 break-words text-base font-semibold">{event.name}</h3><div className="mt-2 flex flex-wrap gap-x-3 gap-y-2 text-xs text-secondary"><p className="flex items-start gap-1"><Icon name="schedule" className="mt-0.5" /><time dateTime={event.startAt}>{eventDate(event.startAt, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {eventTime(event.startAt)} IST</time></p><p className="flex min-w-0 items-start gap-1"><Icon name="location_on" className="mt-0.5" /><span className="break-words">{event.venue}</span></p></div>
        </div>
      </div>
      <Link href={`/events/${event.id}`} aria-label={`View event: ${event.name}`} className="inline-flex min-h-11 shrink-0 items-center self-start rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-semibold shadow-sm hover:text-primary sm:self-center">View event<Icon name="arrow_forward" className="ml-2" /></Link>
    </li>)}</ol>{upcoming > events.length && <p className="mt-4 text-xs text-secondary">Showing the next {events.length} of {upcoming} upcoming events.</p>}</>
      : <div className="mt-5 rounded-xl bg-surface-container-low px-4 py-8 text-center"><Icon name="calendar_month" className="text-4xl text-primary-container" /><h3 className="mt-3 text-lg font-semibold">{total ? "No upcoming events" : "Your celebrations start here"}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">{total ? "Your past celebrations are saved. Open Events to revisit them or plan another celebration." : "Add your first ceremony or celebration to bring your wedding timeline to life."}</p>{canAdd && <Link href="/events/new" className={`${primaryAction} mt-5`}><Icon name="add" />{total ? "Add event" : "Add your first event"}</Link>}{!!total && <Link href="/events?view=past" className={`${secondaryAction} mt-3 ml-2`}>View past events</Link>}</div>}
  </section>;
}
