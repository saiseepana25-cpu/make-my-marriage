import { Icon } from "@/components/marketing/icon";
import { weddingDateLabel } from "@/features/website/format";
import type { PublicWedding, WebsiteEvents } from "@/features/website/types";
import { GuestCelebrations } from "./guest-celebrations";
import { WeddingCountdown } from "./wedding-countdown";
import { WebsiteComingSoon, websitePrimary } from "./website-ui";

export function PublicWeddingContent({ wedding, events, asOf }: { wedding: PublicWedding; events: WebsiteEvents | null; asOf: number }) {
  return <div className="wedding-website">
    <section className="relative overflow-hidden bg-surface-container-low px-5 pt-12 pb-20 sm:px-8 sm:pt-16">
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-primary-fixed/40 blur-3xl" />
      <div className="relative mx-auto max-w-5xl text-center"><p className="inline-block rounded-full bg-surface-container px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">The wedding celebration</p>
        <h1 className="mt-8 break-words font-display-md text-4xl leading-tight text-primary sm:text-6xl">{wedding.groomName} <span className="italic">&amp;</span> {wedding.brideName}</h1>
        <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-on-surface-variant sm:text-base">With the blessings of our families, we joyfully invite you to celebrate our wedding.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm"><p className="flex max-w-full items-start gap-2 rounded-full bg-surface-container-lowest px-5 py-3"><Icon name="calendar_month" className="mt-1 text-primary" /><time dateTime={wedding.weddingDate.slice(0, 10)}>{weddingDateLabel(wedding.weddingDate)}</time></p><p className="flex max-w-full items-start gap-2 rounded-3xl bg-surface-container-lowest px-5 py-3"><Icon name="location_on" className="mt-1 text-primary" /><span className="min-w-0 break-words">{wedding.location}</span></p></div>
        <p className="mx-auto mt-7 flex w-fit max-w-full items-center gap-2 rounded-full bg-surface-container px-5 py-3 text-sm font-semibold text-primary"><Icon name="timelapse" /><WeddingCountdown weddingDate={wedding.weddingDate} asOf={asOf} /></p>
        <a href="#celebrations" className={`${websitePrimary} mt-9`}>View celebrations<Icon name="expand_more" /></a>
      </div>
    </section>
    <GuestCelebrations key={`${wedding.websiteSlug}-${asOf}`} slug={wedding.websiteSlug} initial={events} />
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20"><WebsiteComingSoon /><div className="mt-16 text-center"><Icon name="favorite" className="text-2xl text-primary" /><p className="mt-4 break-words text-xs text-secondary">Crafted with warmth for {wedding.groomName} &amp; {wedding.brideName}’s wedding</p></div></div>
  </div>;
}
