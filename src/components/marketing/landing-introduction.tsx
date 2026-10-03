import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";

export function Hero() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="home" aria-labelledby="home-heading"><div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
        <div className="lg:col-span-7 flex flex-col items-start gap-space-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/40">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Built for Indian weddings &amp; the families who make them happen</span>
          </div>
          <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight font-medium" id="home-heading">
            Plan your wedding.
            <br />
            <span className="italic font-normal text-primary-container">Together</span>{" "}
            with your family.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Events, tasks, guests, expenses, photos, and your wedding website — beautifully organized in one calm, shared workspace.</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full sm:w-auto pt-space-xs">
            <Link className="inline-flex items-center justify-center bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg px-7 py-3.5 rounded-xl shadow-sm transition-all duration-200" href="/signup">Start Planning</Link>
            <a className="inline-flex items-center justify-center border border-outline-variant/60 bg-surface text-on-surface hover:bg-surface-container font-label-lg text-label-lg px-6 py-3.5 rounded-xl transition-all duration-200" href="#how-it-works">See How It Works</a>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm pt-space-xs">
            <Icon name="verified_user" className="text-primary text-[18px]" />
            <span>No credit card required • Invite your entire family anytime</span>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-outline-variant/40 bg-surface-container-low aspect-[4/5] max-h-[560px]">
            <Image src="/images/landing/wedding-couple.jpg" alt="Happy Indian couple in elegant wedding attire surrounded by pastoral warmth" width={1200} height={896} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px" preload className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
          <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 bg-surface/95 backdrop-blur-md border border-outline-variant/60 rounded-2xl p-space-md shadow-2xl max-w-[280px] sm:max-w-[320px] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                LIVE WORKSPACE
              </span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">32 Days to Go</span>
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Next Ceremony</span>
              <div className="flex items-center justify-between text-on-surface">
                <span className="font-headline-sm text-label-lg font-semibold">Mehendi &amp; Sangeet</span>
                <span className="font-body-sm text-body-sm text-secondary">14 Dec</span>
              </div>
            </div>
            <div className="pt-space-xs">
              <div className="flex items-center justify-between font-label-sm text-label-sm mb-1">
                <span className="text-on-surface-variant">Core Milestones</span>
                <span className="font-semibold text-primary">18 / 27 Complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden"><div className="h-full bg-primary-container rounded-full" style={{"width":"66%"}}></div></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm">
              <span className="flex items-center gap-1.5">
                <Icon name="group" className="text-[16px] text-primary" />
                382 Confirmed Guests
              </span>
              <span className="text-secondary font-medium">85% responded</span>
            </div>
            <span className="font-label-sm text-[10px] text-secondary">Illustrative wedding workspace</span>
          </div>
        </div>
      </div></section>
  );
}

export function ProductPromise() {
  return (
    <section className="w-full bg-surface-container-low/70 border-y border-outline-variant/30 py-space-xl" id="features" aria-labelledby="features-heading"><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin flex flex-col items-center gap-space-lg text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-surface border border-outline-variant/40 font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">The Make My Marriage Standard</div>
        <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface max-w-2xl font-normal" id="features-heading">One wedding. One shared workspace. Everyone stays in sync.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg w-full text-left pt-space-md">
          <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-2"><Icon name="diversity_3" className="text-[22px]" /></div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Built for Indian Weddings</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Multiple sacred ceremonies, unified guest lists, distinct family roles, and thoughtful planning across every ritual.</p>
          </div>
          <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mb-2"><Icon name="family_restroom" className="text-[22px]" /></div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Designed for Families</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Clear, respectful workflows for parents, siblings, cousins, and planners without clunky software jargon or messy spreadsheets.</p>
          </div>
          <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed mb-2"><Icon name="history_edu" className="text-[22px]" /></div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Useful Before, During &amp; After</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">From organizing tasks and sharing live ritual links to keeping your wedding records and photos accessible after the celebration.</p>
          </div>
        </div>
      </div></section>
  );
}

export function ScatteredPlanning() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="scattered-planning" aria-labelledby="scattered-planning-heading">
      <div className="flex flex-col items-center text-center gap-space-sm mb-space-xl">
        <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Why spreadsheets fail</span>
        <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="scattered-planning-heading">Everything about an Indian wedding ends up everywhere.</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">WhatsApp groups get buried, multiple Excel versions clash, and critical updates get lost between ten phone calls.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-space-lg items-center">
        <div className="lg:col-span-5 bg-surface-container-low/60 rounded-2xl p-space-lg border border-outline-variant/50 relative overflow-hidden flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30">
            <span className="font-label-lg text-label-lg font-semibold text-secondary flex items-center gap-2">
              <Icon name="cancel" className="text-[18px]" />
              The Fragmented Reality
            </span>
            <span className="font-label-sm text-label-sm text-secondary/70">Unsynced &amp; Stressed</span>
          </div>
          <div className="space-y-3">
            <div className="bg-surface rounded-xl p-3 border border-outline-variant/40 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <Icon name="chat" className="text-[#25D366] text-[20px]" />
                <span className="font-body-md text-body-md text-on-surface">5 Unread WhatsApp Groups</span>
              </div>
              <span className="font-label-sm text-label-sm text-error font-medium">Buried updates</span>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-outline-variant/40 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <Icon name="table_view" className="text-[#107C41] text-[20px]" />
                <span className="min-w-0 break-all font-body-md text-body-md text-on-surface">Guest_List_v4_Final_REAL.xlsx</span>
              </div>
              <span className="font-label-sm text-label-sm text-error font-medium">Duplicate entries</span>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-outline-variant/40 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <Icon name="call" className="text-secondary text-[20px]" />
                <span className="font-body-md text-body-md text-on-surface">Phone call agreements</span>
              </div>
              <span className="font-label-sm text-label-sm text-error font-medium">Forgotten notes</span>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-outline-variant/40 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <Icon name="drive_folder_upload" className="text-primary text-[20px]" />
                <span className="font-body-md text-body-md text-on-surface">Fragmented Photo Links</span>
              </div>
              <span className="font-label-sm text-label-sm text-error font-medium">Scattered links</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 flex justify-center py-space-sm lg:py-0"><div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-sm"><Icon name="arrow_forward" className="text-[24px]" /></div></div>
        <div className="lg:col-span-5 bg-surface rounded-2xl p-space-lg border-2 border-primary-container shadow-md relative flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30">
            <span className="font-label-lg text-label-lg font-semibold text-primary-container flex items-center gap-2">
              <Icon name="check_circle" className="text-[20px]" />
              Make My Marriage Workspace
            </span>
            <span className="font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-semibold">Calm &amp; Unified</span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface font-medium leading-relaxed">Bring your events, tasks, guests, budget, family updates, and wedding memories into one beautifully organized family dashboard.</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-surface-container flex items-center gap-2">
              <Icon name="verified" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Single source of truth</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container flex items-center gap-2">
              <Icon name="supervised_user_circle" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Role-based duties</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container flex items-center gap-2">
              <Icon name="account_balance_wallet" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Clear ledger</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container flex items-center gap-2">
              <Icon name="share" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Clean wedding link</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
