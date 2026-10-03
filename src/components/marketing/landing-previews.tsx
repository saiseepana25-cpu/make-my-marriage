import Image from "next/image";
import { Icon } from "./icon";

export function FamilyPreview() {
  return (
    <section className="w-full bg-surface-container-low/50 py-space-xl lg:py-24 border-y border-outline-variant/30" id="for-families" aria-labelledby="for-families-heading">
      <div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div className="max-w-2xl">
            <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Coordinated ownership</span>
            <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal mt-1" id="for-families-heading">Because Indian weddings aren’t planned by two people.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Bring the bride, groom, parents, siblings, and close relatives into one shared wedding workspace with Owner, Admin, and Family Member roles.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md text-on-surface-variant">Family Members Active:</span>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs ring-2 ring-surface">P</div>
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs ring-2 ring-surface">R</div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs ring-2 ring-surface">S</div>
              <div className="w-8 h-8 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-xs ring-2 ring-surface">V</div>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-sm p-space-md lg:p-space-xl">
          <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/30 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Family Responsibility Roster</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-medium">5 Wedding Team Members</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">All Ceremonies</span>
              <span className="px-3 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">Filter: By Family Member</span>
            </div>
          </div>
          <div className="divide-y divide-outline-variant/20">
            <div className="py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-lowest transition-colors px-2 rounded-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center shrink-0">P</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-label-lg font-semibold text-on-surface">Priya (Bride)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-surface-container text-on-surface-variant font-medium">Owner</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Finalize Mehendi &amp; Sangeet venue layout with decorator</span>
                </div>
              </div>
              <div className="flex items-center gap-space-md self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F3ED] text-[#1E6B47] font-label-sm text-label-sm font-semibold">
                  <Icon name="check_circle" className="text-[16px]" />
                  Completed
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant w-24 text-right">Venue Signed</span>
              </div>
            </div>
            <div className="py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-lowest transition-colors px-2 rounded-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center shrink-0">RK</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-label-lg font-semibold text-on-surface">Rajesh Sharma (Groom&apos;s Father)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-surface-container text-on-surface-variant font-medium">Admin</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Confirm live counters &amp; regional sweet menu for Sangeet &amp; Reception</span>
                </div>
              </div>
              <div className="flex items-center gap-space-md self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
                  <Icon name="pending" className="text-[16px] text-primary" />
                  In Progress
                </span>
                <span className="font-label-sm text-label-sm text-primary font-medium w-24 text-right">Tasting on Sat</span>
              </div>
            </div>
            <div className="py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-lowest transition-colors px-2 rounded-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center shrink-0">A</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-label-lg font-semibold text-on-surface">Arjun (Bride&apos;s Brother)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-surface-container text-on-surface-variant font-medium">Family Member</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Confirm photographer booking and advance payment</span>
                </div>
              </div>
              <div className="flex items-center gap-space-md self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F3ED] text-[#1E6B47] font-label-sm text-label-sm font-semibold">
                  <Icon name="check_circle" className="text-[16px]" />
                  Completed
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant w-24 text-right">Advance confirmed</span>
              </div>
            </div>
            <div className="py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-lowest transition-colors px-2 rounded-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold flex items-center justify-center shrink-0">N</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-label-lg font-semibold text-on-surface">Neha (Groom&apos;s Sister)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-surface-container text-on-surface-variant font-medium">Family Member</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Finalize Sangeet choreography tracklist with dance master</span>
                </div>
              </div>
              <div className="flex items-center gap-space-md self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
                  <Icon name="pending" className="text-[16px] text-primary" />
                  In Progress
                </span>
                <span className="font-label-sm text-label-sm text-primary font-medium w-24 text-right">8 / 12 Songs Set</span>
              </div>
            </div>
            <div className="py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-lowest transition-colors px-2 rounded-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center shrink-0">S</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-label-lg font-semibold text-on-surface">Sunita (Bride&apos;s Mother)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-surface-container text-on-surface-variant font-medium">Family Member</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Finalize custom sweet hampers &amp; out-of-town guest welcome packaging</span>
                </div>
              </div>
              <div className="flex items-center gap-space-md self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
                  <Icon name="pending" className="text-[16px] text-primary" />
                  In Progress
                </span>
                <span className="font-label-sm text-label-sm text-primary font-medium w-24 text-right">Sample approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 px-4 text-center font-label-sm text-label-sm text-secondary">Illustrative preview · Sample wedding data</p>
    </section>
  );
}

export function ActivityPreview() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="family-updates" aria-labelledby="family-updates-heading">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Peace of mind</span>
          <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="family-updates-heading">Everyone stays updated.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">A calm, chronological record of milestones so nobody has to call five relatives just to confirm whether the caterer was paid or invitations dispatched.</p>
          <div className="p-space-md rounded-2xl bg-surface-container border border-outline-variant/40 mt-space-sm"><div className="flex items-start gap-3">
              <Icon name="mail" className="text-primary text-[22px]" />
              <div>
                <h3 className="font-headline-sm text-label-lg font-semibold text-on-surface">Email updates &amp; notifications</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Family members receive clear email invites and updates so everyone remains aligned without clutter.</p>
              </div>
            </div></div>
        </div>
        <div className="lg:col-span-7 bg-surface rounded-2xl p-space-lg border border-outline-variant/50 shadow-sm">
          <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/30 mb-space-md">
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Live Family Timeline</span>
            <span className="font-label-sm text-label-sm text-secondary">Family Updates</span>
          </div>
          <div className="space-y-space-md">
            <div className="flex items-start gap-space-md">
              <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs shrink-0">RK</div>
              <div className="flex-1 bg-surface-container-low/70 rounded-xl p-space-md border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Groom&apos;s Father (Rajesh)</span>
                  <span className="font-label-sm text-label-sm text-secondary">Today • 10:42 AM</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-1">Reception venue balance payment completed via direct bank transfer.</p>
              </div>
            </div>
            <div className="flex items-start gap-space-md">
              <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-xs shrink-0">N</div>
              <div className="flex-1 bg-surface-container-low/70 rounded-xl p-space-md border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Groom&apos;s Sister (Neha)</span>
                  <span className="font-label-sm text-label-sm text-secondary">Today • 12:15 PM</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-1">Sangeet choreography finalized. Family practice schedule confirmed.</p>
              </div>
            </div>
            <div className="flex items-start gap-space-md">
              <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0">P</div>
              <div className="flex-1 bg-surface-container-low/70 rounded-xl p-space-md border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Bride (Priya)</span>
                  <span className="font-label-sm text-label-sm text-secondary">Today • 3:20 PM</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-1">Pheras jewellery set selected from Tanishq. Order confirmed with certification.</p>
              </div>
            </div>
            <div className="flex items-start gap-space-md">
              <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0">A</div>
              <div className="flex-1 bg-surface-container-low/70 rounded-xl p-space-md border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Bride&apos;s Brother (Arjun)</span>
                  <span className="font-label-sm text-label-sm text-secondary">Yesterday • 6:15 PM</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-1">All 450 physical wedding invitations printed, boxed, and delivered to parents&apos; house.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 px-4 text-center font-label-sm text-label-sm text-secondary">Illustrative preview · Sample wedding data</p>
    </section>
  );
}

export function BudgetPreview() {
  return (
    <section className="w-full bg-surface-container-low/60 border-y border-outline-variant/30 py-space-xl lg:py-24" id="guest-and-budget" aria-labelledby="guest-and-budget-heading">
      <div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
        <div className="flex flex-col items-center text-center gap-space-xs mb-space-xl">
          <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Precision Logistics</span>
          <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="guest-and-budget-heading">Know who’s coming. Know where the money is going.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Practical, serious tools engineered to keep both sides calm, coordinated, and fully in control of the finances.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-md">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Guest Roster</span>
                <Icon name="how_to_reg" className="text-primary text-[20px]" />
              </div>
              <div className="text-3xl font-display-md text-on-surface font-medium mb-1">
                500
                <span className="font-body-sm text-body-sm text-secondary">Total Invited</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Track guest responses in one shared wedding guest list.</p>
              <div className="space-y-3 font-body-sm text-body-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E6B47]"></span>
                    Attending
                  </span>
                  <span className="font-semibold text-on-surface">382</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5A83B]"></span>
                    Pending
                  </span>
                  <span className="font-semibold text-on-surface">77</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8C8E90]"></span>
                    Not Attending
                  </span>
                  <span className="font-semibold text-on-surface">41</span>
                </div>
              </div>
            </div>
            <div className="pt-space-md mt-space-md border-t border-outline-variant/20 flex justify-between font-label-sm text-label-sm text-secondary">
              <span>
                Total Guests:
                <strong className="text-on-surface">500</strong>
              </span>
              <span>
                Confirmed:
                <strong className="text-on-surface">382</strong>
              </span>
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-md">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Wedding Budget</span>
                <Icon name="account_balance" className="text-primary text-[20px]" />
              </div>
              <div className="text-3xl font-display-md text-on-surface font-medium mb-1">₹10,00,000</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Allocated Cap across both families</p>
              <div className="mb-space-md">
                <div className="flex justify-between font-label-sm text-label-sm mb-1.5">
                  <span className="text-on-surface font-semibold">₹8,40,000 Spent</span>
                  <span className="text-primary font-bold">84% Used</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden"><div className="h-full bg-primary-container rounded-full" style={{"width":"84%"}}></div></div>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Remaining Cushion:</span>
                <span className="font-headline-sm text-label-lg font-bold text-[#1E6B47]">₹1,60,000</span>
              </div>
            </div>
            <div className="pt-space-md mt-space-md border-t border-outline-variant/20 flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
              <Icon name="shield" className="text-[16px] text-[#1E6B47]" />
              See recorded expenses and remaining budget clearly.
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-space-lg border border-outline-variant/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-md">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Ledger Breakdown</span>
                <Icon name="pie_chart" className="text-primary text-[20px]" />
              </div>
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between font-body-sm text-body-sm mb-1">
                    <span className="text-on-surface font-medium">Venues (All 3 Days)</span>
                    <span className="text-on-surface font-semibold">₹4,20,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden"><div className="bg-primary h-full" style={{"width":"50%"}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between font-body-sm text-body-sm mb-1">
                    <span className="text-on-surface font-medium">Catering &amp; Feasts</span>
                    <span className="text-on-surface font-semibold">₹2,10,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden"><div className="bg-primary/80 h-full" style={{"width":"25%"}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between font-body-sm text-body-sm mb-1">
                    <span className="text-on-surface font-medium">Photography &amp; Video</span>
                    <span className="text-on-surface font-semibold">₹1,20,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden"><div className="bg-primary/60 h-full" style={{"width":"14%"}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between font-body-sm text-body-sm mb-1">
                    <span className="text-on-surface font-medium">Decor, Florals &amp; Sound</span>
                    <span className="text-on-surface font-semibold">₹90,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden"><div className="bg-primary/40 h-full" style={{"width":"11%"}}></div></div>
                </div>
              </div>
            </div>
            <div className="pt-space-md mt-space-md border-t border-outline-variant/20 font-label-sm text-label-sm text-on-surface-variant flex justify-between items-center">
              <span>Expense entries recorded.</span>
              <span className="font-semibold text-primary">14 entries</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 px-4 text-center font-label-sm text-label-sm text-secondary">Illustrative preview · Sample wedding data</p>
    </section>
  );
}

export function GuestPreview() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="guest-experience" aria-labelledby="guest-experience-heading">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
        <div className="lg:col-span-6 flex flex-col items-start gap-space-md">
          <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Flawless Guest Journey</span>
          <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="guest-experience-heading">One beautiful link for every guest.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Share your ceremony schedule, venue Google Map pins, event descriptions with dress notes, 1-click RSVP, and live photo sharing. Guests can access the wedding website without creating an account.</p>
          <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 truncate text-on-surface font-mono text-body-sm">
              <Icon name="link" className="text-primary text-[18px]" />
              <span className="truncate">makemymarriage.in/wedding/sai-priya</span>
            </div>
            <span className="shrink-0 bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/60 text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container transition">Copy Link</span>
          </div>
          <div className="flex items-center gap-3 p-space-md rounded-xl bg-primary-fixed/30 border border-primary-fixed text-primary font-body-sm text-body-sm">
            <Icon name="sentiment_satisfied" className="text-[20px]" />
            <span>
              <strong>Zero login barriers:</strong>{" "}
              Guests open the wedding website link directly to view ceremony details, directions, submit RSVPs, and upload photos.
            </span>
          </div>
        </div>
        <div className="lg:col-span-6 flex justify-center"><div className="w-[300px] sm:w-[340px] rounded-[36px] bg-[#1F2024] p-3 shadow-2xl border-4 border-[#2E3035]"><div className="w-full rounded-[28px] bg-surface overflow-hidden border border-outline-variant/30 flex flex-col">
              <div className="w-full h-6 bg-surface flex items-center justify-center pt-1"><div className="w-16 h-3 bg-[#1F2024] rounded-full"></div></div>
              <div className="p-space-md flex flex-col gap-3">
                <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-sm">
                  <Image src="/images/landing/ceremony-couple.jpg" alt="Sai and Priya laughing during their vibrant Indian wedding ceremony" width={768} height={1376} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-3 text-white">
                    <span className="font-display-md text-headline-sm font-medium">Sai &amp; Priya</span>
                    <span className="font-body-sm text-[12px] opacity-90">20 December • The Leela Palace</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-2.5 rounded-lg bg-surface-container text-on-surface flex flex-col gap-1">
                    <Icon name="calendar_month" className="text-primary text-[18px]" />
                    <span className="font-label-sm text-[11px] font-semibold">4 Events</span>
                    <span className="text-[10px] text-on-surface-variant">Haldi to Reception</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container text-on-surface flex flex-col gap-1">
                    <Icon name="near_me" className="text-primary text-[18px]" />
                    <span className="font-label-sm text-[11px] font-semibold">Directions</span>
                    <span className="text-[10px] text-on-surface-variant">Google Maps 1-Tap</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-primary-container text-white flex items-center justify-between text-left">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-xs font-semibold">1-Click RSVP</span>
                    <span className="text-[10px] opacity-80">Confirm attending count</span>
                  </div>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <Icon name="photo_camera" className="text-primary text-[18px]" />
                    <span className="font-label-sm text-xs text-on-surface font-medium">Guest Photo Uploads</span>
                  </div>
                  <span className="text-[11px] text-secondary font-semibold">Open</span>
                </div>
              </div>
              <div className="w-full h-5 flex items-center justify-center pb-1"><div className="w-24 h-1 bg-outline-variant rounded-full"></div></div>
            </div></div></div>
      </div>
      <p className="mx-auto mt-4 px-4 text-center font-label-sm text-label-sm text-secondary">Illustrative preview · Sample wedding data</p>
    </section>
  );
}

export function DashboardPreview() {
  return (
    <section className="w-full bg-surface-container-low/80 py-space-xl lg:py-24 border-y border-outline-variant/30" id="workspace-preview" aria-labelledby="workspace-preview-heading">
      <div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
        <div className="flex flex-col items-center text-center gap-space-xs mb-space-xl">
          <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">The Central Cockpit</span>
          <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="workspace-preview-heading">Your whole wedding at a glance.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Engineered for clarity, calm control, and swift family decisions without visual clutter.</p>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xl overflow-hidden">
          <div className="bg-surface-container px-space-lg py-space-md border-b border-outline-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold text-sm">SV</div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Sharma • Verma Wedding Workspace</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Primary City: Jaipur • Dec 13–15 • 32 Days to Go</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-outline-variant/50 font-label-sm text-label-sm text-on-surface font-medium">
                <span className="w-2 h-2 rounded-full bg-[#1E6B47]"></span>
                Cloud Synced
              </span>
              <span className="bg-primary-container text-on-primary px-3.5 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold hover:bg-primary transition">+ New Entry</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-outline-variant/30 border-b border-outline-variant/30 bg-surface">
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Next Event</span>
              <div className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1">Mehendi &amp; Sangeet</div>
              <span className="font-body-sm text-body-sm text-primary font-medium">14 Dec • 4:00 PM</span>
            </div>
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Task Progress</span>
              <div className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1">18 of 27 Done</div>
              <span className="font-body-sm text-body-sm text-[#1E6B47] font-medium">9 Critical Pending</span>
            </div>
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Confirmed Headcount</span>
              <div className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1">382 Attending</div>
              <span className="font-body-sm text-body-sm text-secondary font-medium">77 Pending Responses</span>
            </div>
            <div className="p-space-md">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Disbursed Budget</span>
              <div className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1">₹8,40,000 / 10L</div>
              <span className="font-body-sm text-body-sm text-primary-container font-medium">Within 84% Threshold</span>
            </div>
          </div>
          <div className="p-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="lg:col-span-7 flex flex-col gap-space-sm">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="font-headline-sm text-label-lg font-semibold text-on-surface">Ceremony Master Timeline</span>
                <span className="text-primary font-label-sm text-label-sm font-semibold">View All 4 Ceremonies</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-md bg-primary-fixed text-primary font-bold text-xs">EVENT 1</div>
                    <div>
                      <h4 className="font-label-lg text-label-lg font-semibold text-on-surface">Haldi &amp; Chooda</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Poolside Pavilion • Morning 10:00 AM</p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface border border-outline-variant/40 text-secondary">Yellow Traditional</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">EVENT 2</div>
                    <div>
                      <h4 className="font-label-lg text-label-lg font-semibold text-on-surface">Sangeet &amp; Cocktail</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Grand Ballroom • Evening 7:30 PM</p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface border border-outline-variant/40 text-secondary">Indo-Western Glitz</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs">EVENT 3</div>
                    <div>
                      <h4 className="font-label-lg text-label-lg font-semibold text-on-surface">Pheras &amp; Wedding</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Heritage Courtyard • Dusk 5:00 PM</p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface border border-outline-variant/40 text-secondary">Royal Ethnic</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-space-sm">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="font-headline-sm text-label-lg font-semibold text-on-surface">Action Items Due This Week</span>
                <span className="text-secondary font-label-sm text-label-sm">4 items</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded border border-outline text-[12px] bg-primary text-white" aria-hidden="true">
                    <Icon name="check" />
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface line-through text-secondary">Verify baraat brass band permit</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded border border-outline text-[12px]" aria-hidden="true"></span>
                  <span className="font-body-sm text-body-sm text-on-surface">Confirm photographer timing</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded border border-outline text-[12px]" aria-hidden="true"></span>
                  <span className="font-body-sm text-body-sm text-on-surface">Finalize ceremony decorations</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded border border-outline text-[12px]" aria-hidden="true"></span>
                  <span className="font-body-sm text-body-sm text-on-surface">Review the guest list</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 px-4 text-center font-label-sm text-label-sm text-secondary">Illustrative preview · Sample wedding data</p>
    </section>
  );
}
