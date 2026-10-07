"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/marketing/icon";
import { dashboardNavigation } from "@/config/navigation";
import type { CurrentUser } from "@/types/domain";

const icons = ["grid_view", "calendar_month", "checklist", "group", "account_balance_wallet", "photo_library", "family_restroom", "history_edu", "language", "settings"] as const;
const availableRoutes = new Set(["/dashboard", "/events", "/tasks"]);

export function Sidebar({ couple, date, user }: { couple: string; date: string; user: CurrentUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return <>
    <button ref={toggle} type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close workspace menu" : "Open workspace menu"}
      aria-expanded={open} aria-controls="workspace-sidebar" className="fixed top-5 left-4 z-50 flex size-9 items-center justify-center rounded-xl bg-surface-container-low text-xl text-primary lg:hidden">
      <Icon name={open ? "close" : "menu"} />
    </button>
    {open && <button type="button" aria-label="Close menu backdrop" onClick={() => setOpen(false)} className="fixed inset-0 top-20 z-30 bg-on-surface/30 lg:hidden" />}
    <aside id="workspace-sidebar" aria-label="Wedding navigation" className={`${open ? "flex" : "hidden"} fixed top-20 bottom-0 left-0 z-40 w-72 flex-col justify-between overflow-y-auto bg-surface-container-lowest shadow-sm lg:top-0 lg:flex`}>
      <div>
        <Link href="/dashboard" onClick={() => setOpen(false)} className="hidden items-center gap-2 px-6 pt-7 font-display-md text-[21px] leading-tight text-primary lg:flex">
          <Image src="/images/landing/brand.png" alt="" width={30} height={30} />Make My Marriage
        </Link>
        <div className="mx-5 my-6 rounded-xl bg-surface-container-low p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Active celebration</p>
          <p className="mt-2 break-words text-lg font-semibold">{couple}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{date}</p>
        </div>
        <nav aria-label="Wedding workspace" className="px-4"><ul className="space-y-1">
          {dashboardNavigation.map(({ href, label }, index) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            if (!availableRoutes.has(href)) return <li key={href}><span aria-disabled="true" className="flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant">
              <span className="flex min-w-0 items-center gap-3"><Icon name={icons[index]} className="text-xl" /><span>{label}</span></span>
              <span className="shrink-0 rounded-full bg-secondary-container px-2 py-0.5 text-[9px] text-on-secondary-container">Coming soon</span>
            </span></li>;
            return <li key={href}><Link href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary-container text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"}`}>
              <Icon name={icons[index]} className="text-xl" />{label}
            </Link></li>;
          })}
        </ul></nav>
      </div>
      <div className="m-4 flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary" aria-hidden="true">{Array.from(user.name)[0]}</span>
        <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="text-xs text-on-surface-variant">{user.role === "OWNER" ? "Owner" : user.role === "ADMIN" ? "Admin" : "Family member"}</p></div>
      </div>
    </aside>
  </>;
}
