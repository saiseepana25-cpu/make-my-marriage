import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";

export function WeddingJourney() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="wedding-journey" aria-labelledby="wedding-journey-heading">
      <div className="flex flex-col items-center text-center gap-space-xs mb-space-xl">
        <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">End-to-End Continuity</span>
        <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="wedding-journey-heading">From the first plan to the last photograph.</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Make My Marriage doesn&apos;t disappear when the rituals begin. We stay with you through the entire journey.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg relative">
        <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm relative">
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-label-md">01</div>
          <span className="font-label-md text-label-md text-primary uppercase font-bold tracking-wider">BEFORE THE CELEBRATION</span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">The Planning Phase</h3>
          <ul className="space-y-2 pt-2 text-on-surface-variant font-body-md text-body-md">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Multi-ceremony event blueprint
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Delegated family tasks &amp; email invites
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Unified guest list &amp; RSVP tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Categorized expense recording
            </li>
          </ul>
        </div>
        <div className="bg-surface rounded-2xl p-space-lg border-2 border-primary-container shadow-md flex flex-col gap-space-sm relative">
          <div className="w-10 h-10 rounded-full bg-primary-container text-white font-bold flex items-center justify-center text-label-md">02</div>
          <span className="font-label-md text-label-md text-primary-container uppercase font-bold tracking-wider">DURING CEREMONY DAYS</span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">The Execution Phase</h3>
          <ul className="space-y-2 pt-2 text-on-surface-variant font-body-md text-body-md">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Keep family coordinated on tasks
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Direct guest maps &amp; ceremony timing
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Easy access to external ceremony livestream links
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Instant guest candid photo uploads
            </li>
          </ul>
        </div>
        <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm relative">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center text-label-md">03</div>
          <span className="font-label-md text-label-md text-secondary uppercase font-bold tracking-wider">AFTER THE FAREWELL</span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">The Legacy Archive</h3>
          <ul className="space-y-2 pt-2 text-on-surface-variant font-body-md text-body-md">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Review final recorded expenses
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Curated shared wedding photo gallery
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Preserved family timeline updates
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Keep accessing your wedding records and memories after the wedding
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function WeddingMemories() {
  return (
    <section className="w-full bg-surface-container-low/50 py-space-xl lg:py-24 border-y border-outline-variant/30" id="wedding-memories" aria-labelledby="wedding-memories-heading"><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div className="max-w-xl">
            <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Timeless Keepsake</span>
            <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal mt-1" id="wedding-memories-heading">The planning ends. The memories stay.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Keep your sacred ceremonies, family candid smiles, and heartfelt greetings beautifully preserved long after the mandap is folded.</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="photo_library" className="text-primary text-[20px]" />
            <span className="font-label-md text-label-md text-secondary">Keep accessing your wedding records and memories after the wedding</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
          <div className="md:col-span-4 rounded-2xl overflow-hidden shadow-md border border-outline-variant/40 bg-surface relative group aspect-[3/4]">
            <Image src="/images/landing/family-moments.jpg" alt="Indian bride surrounded by her mother and sister helping her get ready in traditional pastel lehenga" width={1264} height={848} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-space-md text-white">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary-fixed">Family Moments</span>
              <h3 className="font-headline-sm text-headline-sm font-medium">Getting Ready with Aai &amp; Sister</h3>
              <p className="font-body-sm text-body-sm opacity-90">Morning preparations &amp; blessings</p>
            </div>
          </div>
          <div className="md:col-span-4 rounded-2xl overflow-hidden shadow-md border border-outline-variant/40 bg-surface relative group aspect-[3/4]">
            <Image src="/images/landing/ceremony-couple.jpg" alt="Indian couple sharing a joyful laugh under the floral wedding mandap" width={768} height={1376} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-space-md text-white">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary-fixed">Sacred Vows</span>
              <h3 className="font-headline-sm text-headline-sm font-medium">Pheras &amp; Joyful Promises</h3>
              <p className="font-body-sm text-body-sm opacity-90">Pure laughter under the marigold arch</p>
            </div>
          </div>
          <div className="md:col-span-4 rounded-2xl overflow-hidden shadow-md border border-outline-variant/40 bg-surface relative group aspect-[3/4]">
            <Image src="/images/landing/wedding-couple.jpg" alt="Bride in deep wine shawl and groom in ivory sherwani under ceremonial drapery" width={1200} height={896} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-space-md text-white">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary-fixed">Evening Reception</span>
              <h3 className="font-headline-sm text-headline-sm font-medium">Under the Golden Dusk</h3>
              <p className="font-body-sm text-body-sm opacity-90">Welcoming family and friends to the feast</p>
            </div>
          </div>
        </div>
      </div></section>
  );
}

export function HowItWorks() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="how-it-works" aria-labelledby="how-it-works-heading">
      <div className="flex flex-col items-center text-center gap-space-xs mb-space-xl">
        <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Simple Onboarding</span>
        <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="how-it-works-heading">Simple from the first step.</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Get up and running in under five minutes. No complicated configuration or technical training required.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container text-primary font-bold flex items-center justify-center font-mono">1</div>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Create Your Wedding</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Add the couple names, wedding dates, and destination city to instantly generate your private planning suite.</p>
        </div>
        <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container text-primary font-bold flex items-center justify-center font-mono">2</div>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Invite Your Family</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Invite parents, siblings, and trusted family members by email to join your shared wedding workspace.</p>
        </div>
        <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container text-primary font-bold flex items-center justify-center font-mono">3</div>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Plan Together</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Log ceremonies, assign duties, coordinate plans, and record expenses without stressful misunderstandings.</p>
        </div>
        <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container text-primary font-bold flex items-center justify-center font-mono">4</div>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Share with Guests</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Publish your clean guest portal, collect one-tap RSVPs, broadcast directions, and receive live guest photos.</p>
        </div>
      </div>
    </section>
  );
}

export function PlanningPrivacy() {
  return (
    <section className="w-full bg-surface-container-low/60 border-y border-outline-variant/30 py-space-xl lg:py-24" id="planning-privacy" aria-labelledby="planning-privacy-heading"><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin"><div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          <div className="lg:col-span-5 flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Confidential &amp; Dignified</span>
            <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="planning-privacy-heading">Your wedding planning stays with your family.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">We understand how personal and delicate family finances, guest lists, and agreements are. Your data is never sold or broadcast publicly.</p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="bg-surface p-space-md rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-2">
              <Icon name="no_accounts" className="text-primary text-[24px]" />
              <h3 className="font-headline-sm text-label-lg font-semibold text-on-surface">No Guest Account Friction</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Guests access itinerary and maps with zero sign-up hoops.</p>
            </div>
            <div className="bg-surface p-space-md rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-2">
              <Icon name="visibility_off" className="text-primary text-[24px]" />
              <h3 className="font-headline-sm text-label-lg font-semibold text-on-surface">Strict Ledger Privacy</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Budgets and internal notes never leak to your public guest site.</p>
            </div>
            <div className="bg-surface p-space-md rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-2">
              <Icon name="admin_panel_settings" className="text-primary text-[24px]" />
              <h3 className="font-headline-sm text-label-lg font-semibold text-on-surface">Family Role Safeguards</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Owner, Admin, and Family Member roles keep planning organized while keeping wedding planning private to invited members.</p>
            </div>
          </div>
        </div></div></section>
  );
}

export function WeddingSuite() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="wedding-suite" aria-labelledby="wedding-suite-heading"><div className="bg-surface rounded-3xl border border-outline-variant/60 shadow-lg p-space-lg lg:p-space-xl"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
          <div className="max-w-xl flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Complete Wedding Suite</span>
            <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="wedding-suite-heading">Everything you need to plan your wedding together.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Full access to every logistical module, multi-user family roles, and the guest wedding website for your entire celebration.</p>
            <div className="pt-space-md"><Link className="inline-flex items-center justify-center bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg px-8 py-4 rounded-xl shadow-sm transition-all duration-200" href="/signup">Start Planning Now</Link></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-space-lg gap-y-3 lg:max-w-lg">
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Multi-Ceremony Schedules</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Family Roles (Owner, Admin, Member)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Task Management &amp; Assignments</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Unified Wedding Guest List &amp; RSVP Tracker</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Categorized Expense Recording</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Public Guest Website &amp; Maps</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Guest Candid Photo Uploads</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" className="text-[#1E6B47] text-[20px]" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Post-Wedding Records &amp; Memories Access</span>
            </div>
          </div>
        </div></div></section>
  );
}

export function FinalInvitation() {
  return (
    <section className="w-full bg-linear-to-b from-surface to-surface-container-low border-t border-outline-variant/30 py-space-xl lg:py-28" id="start-together" aria-labelledby="start-together-heading"><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin text-center flex flex-col items-center gap-space-md">
        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-1"><Icon name="favorite" className="text-[24px]" /></div>
        <h2 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface font-normal max-w-2xl" id="start-together-heading">
          Plan less chaos.
          <br />
          <span className="italic font-normal text-primary-container">Enjoy more</span>{" "}
          of your wedding.
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Bring your family, guests, events, and memories together in one calm, dignified workspace.</p>
        <div className="pt-space-sm"><Link className="inline-flex items-center justify-center bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm px-9 py-4 rounded-xl shadow-md transition-all duration-200" href="/signup">Start Planning Together</Link></div>
        <span className="font-label-sm text-label-sm text-secondary">Takes 2 minutes to set up • Always private</span>
      </div></section>
  );
}
