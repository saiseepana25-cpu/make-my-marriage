import { Icon } from "./icon";

export function LandingFaq() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24" id="faq" aria-labelledby="faq-heading"><div className="max-w-3xl mx-auto flex flex-col gap-space-lg">
        <div className="text-center flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">Common Questions</span>
          <h2 className="font-display-md text-headline-lg lg:text-display-md text-on-surface font-normal" id="faq-heading">Frequently Asked Questions</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Everything you need to know about setting up your family wedding workspace.</p>
        </div>
        <div className="space-y-space-sm pt-space-md" id="faq-container">
          <details className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden group" name="landing-faq">
            <summary className="w-full p-space-md text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-on-surface font-semibold hover:bg-surface-container-low transition cursor-pointer list-none">
              <span>Can my parents and siblings use the same wedding workspace?</span>
              <Icon name="expand_more" className="text-primary text-[22px] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-space-md pb-space-md text-on-surface-variant font-body-md text-body-md border-t border-outline-variant/20 pt-2">Yes. Invite your parents, siblings, and trusted family members into one shared wedding workspace. Owners and admins manage the planning, while family members can follow progress, update assigned tasks, upload photos, and share family updates.</div>
          </details>
          <details className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden group" name="landing-faq">
            <summary className="w-full p-space-md text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-on-surface font-semibold hover:bg-surface-container-low transition cursor-pointer list-none">
              <span>Do wedding guests need to create an account?</span>
              <Icon name="expand_more" className="text-primary text-[22px] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-space-md pb-space-md text-on-surface-variant font-body-md text-body-md border-t border-outline-variant/20 pt-2">No. Guests never need to download an application or create an account. They simply click your unique wedding link on their phone to view the itinerary, launch Google Maps directions, submit their RSVP attendance, and upload photos.</div>
          </details>
          <details className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden group" name="landing-faq">
            <summary className="w-full p-space-md text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-on-surface font-semibold hover:bg-surface-container-low transition cursor-pointer list-none">
              <span>Can I create Haldi, Mehendi, Sangeet, Wedding, and Reception events?</span>
              <Icon name="expand_more" className="text-primary text-[22px] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-space-md pb-space-md text-on-surface-variant font-body-md text-body-md border-t border-outline-variant/20 pt-2">Yes. You can create as many distinct ceremonies and sub-functions as your celebration requires, each with its own venue, date, and description, where you can include dress guidance.</div>
          </details>
          <details className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden group" name="landing-faq">
            <summary className="w-full p-space-md text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-on-surface font-semibold hover:bg-surface-container-low transition cursor-pointer list-none">
              <span>Can I track wedding expenses across multiple family contributors?</span>
              <Icon name="expand_more" className="text-primary text-[22px] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-space-md pb-space-md text-on-surface-variant font-body-md text-body-md border-t border-outline-variant/20 pt-2">Yes. Owners and admins can record expenses. Family members can view recorded expenses and the wedding budget. Families can track expense amounts, who paid, paid amounts, payment status, remaining amounts, and notes. Expenses are recorded manually; the app does not process payments.</div>
          </details>
          <details className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden group" name="landing-faq">
            <summary className="w-full p-space-md text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-on-surface font-semibold hover:bg-surface-container-low transition cursor-pointer list-none">
              <span>Can guests upload candid photos during the wedding?</span>
              <Icon name="expand_more" className="text-primary text-[22px] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-space-md pb-space-md text-on-surface-variant font-body-md text-body-md border-t border-outline-variant/20 pt-2">Yes. Guests can upload candid photos directly via their web browser using your wedding link. Uploaded photos become available in the wedding gallery after a successful upload, with optional organization by event.</div>
          </details>
          <details className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden group" name="landing-faq">
            <summary className="w-full p-space-md text-left flex items-center justify-between gap-4 font-headline-sm text-headline-sm text-on-surface font-semibold hover:bg-surface-container-low transition cursor-pointer list-none">
              <span>Can I access my wedding workspace after the wedding is over?</span>
              <Icon name="expand_more" className="text-primary text-[22px] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-space-md pb-space-md text-on-surface-variant font-body-md text-body-md border-t border-outline-variant/20 pt-2">Yes. You can keep accessing your wedding records, guest details, expense logs, and shared photo gallery after the wedding.</div>
          </details>
        </div>
      </div></section>
  );
}
