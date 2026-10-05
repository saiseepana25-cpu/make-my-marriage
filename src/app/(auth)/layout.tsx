import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-surface-bright">
    <header className="flex h-20 items-center justify-between gap-3 border-b border-outline-variant/40 px-5 sm:px-10">
      <Link href="/" className="flex items-center gap-2 text-primary" aria-label="Make My Marriage home">
        <Image src="/images/landing/brand.png" alt="" width={32} height={32} className="size-6 shrink-0 sm:size-8" />
        <span className="whitespace-nowrap font-display-md text-[15px] font-semibold sm:text-lg">Make My Marriage</span>
      </Link>
      <Link href="/" className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-on-surface-variant sm:text-sm">Back to home</Link>
    </header>
    <main id="main-content" tabIndex={-1} className="grid min-h-[calc(100dvh-5rem)] lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative m-5 hidden overflow-hidden rounded-[32px] bg-primary lg:block">
        <Image src="/images/landing/wedding-couple.jpg" alt="A couple celebrating their wedding" fill priority sizes="48vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3f0015]/95 via-[#3f0015]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">For every moment. For everyone.</p>
          <h2 className="max-w-lg font-display-lg text-[40px] leading-tight xl:text-[48px]">A wedding to remember.<br /><em>A plan to share.</em></h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/85">Bring your family, your plans, and all the little details together in one place.</p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/90">{["Made for Indian weddings", "Planned together"].map(text => <span key={text} className="rounded-full border border-white/25 px-3 py-2">{text}</span>)}</div>
        </div>
      </aside>
      <div className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-12 lg:px-12">{children}</div>
    </main>
  </div>;
}
