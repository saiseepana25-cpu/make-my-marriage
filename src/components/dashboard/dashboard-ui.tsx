import Link from "next/link";
import { Icon } from "@/components/marketing/icon";
import { primaryAction, secondaryAction } from "@/components/tasks/task-ui";
import { weddingCountdown } from "@/features/dashboard/format";

export const dashboardCard = "min-w-0 rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-7";

export function WeddingOverview({ wedding, asOf, canAddTasks, canAddEvents }: {
  wedding: { groomName: string; brideName: string; weddingDate: string; location: string };
  asOf: number; canAddTasks: boolean; canAddEvents: boolean;
}) {
  const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(wedding.weddingDate));
  const initials = `${Array.from(wedding.groomName)[0] ?? ""}${Array.from(wedding.brideName)[0] ?? ""}`;
  return <section aria-label="Your wedding overview" className={`${dashboardCard} relative overflow-hidden`}>
    <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary-fixed/30 blur-3xl" />
    <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
      <div className="flex min-w-0 items-center gap-4 sm:gap-6">
        <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/50 font-display-md text-2xl text-primary sm:size-24 sm:text-4xl">{initials}</span>
        <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary sm:text-xs">Your wedding workspace</p>
          <h1 className="mt-1 break-words font-display-md text-[28px] leading-tight text-primary sm:text-4xl">{wedding.groomName} <span className="italic">&amp;</span> {wedding.brideName}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant sm:text-sm">
            <p className="flex items-center gap-1.5"><Icon name="calendar_month" className="text-base" /><time dateTime={wedding.weddingDate.slice(0, 10)}>{date}</time></p>
            <p className="flex min-w-0 items-start gap-1.5"><Icon name="location_on" className="mt-0.5 text-base" /><span className="break-words">{wedding.location}</span></p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="rounded-xl bg-surface-container-low px-5 py-4"><p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">Celebrating together</p>
          <p className="mt-1 font-display-md text-2xl leading-snug text-primary">{weddingCountdown(wedding.weddingDate, asOf)}</p>
        </div>
        {(canAddTasks || canAddEvents) && <div className="flex flex-wrap gap-3">
          {canAddTasks && <Link href="/tasks/new" className={`${primaryAction} flex-1 whitespace-nowrap sm:flex-none`}><Icon name="add" className="text-lg" />Add task</Link>}
          {canAddEvents && <Link href="/events/new" className={`${secondaryAction} flex-1 whitespace-nowrap sm:flex-none`}><Icon name="add" className="text-lg" />Add event</Link>}
        </div>}
      </div>
    </div>
  </section>;
}

const futureModules = [
  { title: "Gallery", description: "View and share wedding photos.", icon: "photo_library" },
  { title: "Wedding Website", description: "Share wedding details and events with guests.", icon: "language" },
] as const;
export function FutureModules() {
  return <aside aria-label="Upcoming planning features" className="space-y-5">
    {futureModules.map(module => <section key={module.title} className={dashboardCard}>
      <div className="flex flex-wrap items-center justify-between gap-2"><Icon name={module.icon} className="text-2xl text-primary-container" />
        <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-semibold text-on-secondary-container">Coming soon</span>
      </div>
      <h2 className="mt-4 text-lg font-semibold">{module.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{module.description}</p>
    </section>)}
  </aside>;
}

export function SectionSkeleton({ kind }: { kind: "tasks" | "events" }) {
  return <div role="status" aria-label={`Loading ${kind}`} aria-busy="true" className="space-y-6">
    <section className={dashboardCard}>
      <span className="sr-only">Loading {kind}…</span>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="h-6 w-3/5 rounded bg-surface-container" /><div className="h-3 w-4/5 rounded bg-surface-container-low" />
        {kind === "tasks" ? <><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map(key => <div key={key} className="h-24 rounded-xl bg-surface-container-low" />)}</div><div className="h-3 rounded-full bg-surface-container" /></>
          : [0, 1, 2].map(key => <div key={key} className="h-28 rounded-xl bg-surface-container-low" />)}
      </div>
    </section>
    {kind === "tasks" && <section aria-hidden="true" className={`${dashboardCard} space-y-4 motion-safe:animate-pulse`}><div className="h-6 w-1/2 rounded bg-surface-container" />{[0, 1, 2].map(key => <div key={key} className="h-24 rounded-xl bg-surface-container-low" />)}</section>}
  </div>;
}
