import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/marketing/icon";

export default function WeddingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-outline-variant/20 bg-background/95 px-5 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"><Link href="/" className="flex items-center gap-2 font-display-md text-xl text-primary sm:text-2xl"><Icon name="favorite" />Make My Marriage</Link>
          <nav aria-label="Wedding website sections" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold sm:gap-x-6"><a href="#celebrations" className="inline-flex min-h-11 items-center text-primary">Celebrations</a><a href="#venues" className="inline-flex min-h-11 items-center text-primary">Venue information</a>{["RSVP", "Gallery"].map(label => <span key={label} aria-disabled="true" className="text-secondary">{label}<span className="ml-1 rounded bg-surface-container px-1.5 py-1 text-[9px]">Soon</span></span>)}</nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="bg-surface-container-low px-5 py-10 text-center"><p className="font-display-md text-xl text-primary">Make My Marriage</p><p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-secondary">A graceful union celebrated with heartfelt traditions, cherished family, and everlasting memories.</p></footer>
    </>
  );
}
