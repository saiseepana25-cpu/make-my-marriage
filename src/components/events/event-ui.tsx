import Link from "next/link";
import { Icon } from "@/components/marketing/icon";

export const primaryAction = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary";
export const secondaryAction = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface-container-low px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container";
export const ceremonies = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"];

export function BackToEvents() {
  return <Link href="/events" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"><Icon name="arrow_back" className="text-lg" />Back to events</Link>;
}

export function EventIllustration() {
  return <svg aria-hidden="true" viewBox="0 0 96 96" fill="none" className="size-28 text-primary">
    <circle cx="48" cy="48" r="46" fill="currentColor" opacity=".04" />
    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeDasharray="3 3" opacity=".2" />
    <path d="M26 72V38c0-25 44-25 44 0v34M20 72h56M36 32c0 4 3 7 6 7m18-7c0 4-3 7-6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="35" y="44" width="26" height="23" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M35 51h26M41 41v6m14-6v6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="48" cy="59" r="3.5" fill="currentColor" />
  </svg>;
}
