import type { Metadata } from "next";
import { requirePageUser } from "@/features/auth/current-user";
import { getCurrentWedding } from "@/features/weddings/service";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function Page() {
  const user = await requirePageUser();
  const wedding = await getCurrentWedding();
  const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(wedding.weddingDate));
  return <div className="space-y-8">
    <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your shared wedding space</p>
      <h1 className="font-display-lg text-[34px] leading-tight text-primary">Dashboard</h1>
      <p className="mt-3 text-on-surface-variant">Welcome, {user.name}. Your wedding workspace is ready.</p>
    </div>
    <section aria-labelledby="wedding-title" className="rounded-[28px] border border-outline-variant/50 bg-surface-container-lowest p-6 sm:p-9">
      <p className="mb-3 text-sm font-medium text-on-surface-variant">Celebrating together</p>
      <h2 id="wedding-title" className="font-display-md text-[32px] leading-tight text-primary">{wedding.groomName} <span className="italic">&amp;</span> {wedding.brideName}</h2>
      <dl className="mt-7 grid gap-5 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Wedding date</dt><dd className="mt-2 text-lg">{date}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Location</dt><dd className="mt-2 break-words text-lg">{wedding.location}</dd></div>
      </dl>
    </section>
    <section aria-labelledby="planning-title" className="rounded-[28px] bg-surface-container-low p-6 sm:p-9">
      <h2 id="planning-title" className="font-display-md text-[25px] leading-snug text-primary">A fresh start for your wedding plans</h2>
      <p className="mt-3 max-w-xl leading-relaxed text-on-surface-variant">Your wedding details are saved. This is where your events, tasks, and family updates will come together as you begin planning.</p>
    </section>
  </div>;
}
