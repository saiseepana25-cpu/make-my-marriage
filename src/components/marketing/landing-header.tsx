"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";

const navigation = [
  ["Features", "#features"],
  ["How It Works", "#how-it-works"],
  ["For Families", "#for-families"],
  ["Guest Experience", "#guest-experience"],
  ["FAQ", "#faq"],
] as const;

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function LandingHeader() {
  // Keep the SSR menu button disabled until React can respond to its clicks.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/40 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-gutter-mobile lg:px-margin">
        <Link href="/" aria-label="Make My Marriage home" className="flex shrink-0 items-center gap-space-sm">
          <Image src="/images/landing/brand.png" alt="" width={32} height={32} className="size-8 object-contain" />
          <span className="font-display-md text-[17px] font-semibold tracking-tight text-primary sm:text-headline-sm">Make My Marriage</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-space-lg min-[1200px]:flex">
          {navigation.map(([label, href]) => (
            <a key={href} href={href} className="py-space-xs font-label-lg text-label-lg text-on-surface-variant transition-colors hover:text-primary">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-space-md">
          <Link href="/login" className="hidden px-space-sm py-space-xs font-label-lg text-label-lg text-on-surface-variant transition-colors hover:text-primary sm:inline-flex">Login</Link>
          <Link href="/signup" className="hidden items-center justify-center rounded-full bg-primary-container px-space-lg py-space-sm font-label-lg text-label-lg text-on-primary shadow-sm transition-colors hover:bg-primary sm:inline-flex">Start Planning</Link>
          <Link href="/login" aria-label="Log in to your account" className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[18px] text-on-primary min-[1200px]:flex"><Icon name="person" /></Link>
          <button ref={toggle} type="button" disabled={!hydrated} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-[24px] text-on-surface-variant hover:bg-surface-container min-[1200px]:hidden">
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen} className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-outline-variant/40 bg-surface px-gutter-mobile pb-6 pt-3 min-[1200px]:hidden">
        {navigation.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-3 font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container">{label}</a>
        ))}
        <div className="mt-3 flex flex-wrap items-center gap-3 px-3">
          <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-outline-variant px-5 py-3 font-semibold">Login</Link>
          <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-xl bg-primary-container px-5 py-3 font-semibold text-on-primary hover:bg-primary">Start Planning</Link>
        </div>
      </nav>
    </header>
  );
}
