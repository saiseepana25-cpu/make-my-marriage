import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { guestFamilies } from "@/features/guests/service";
import { getPageGuest } from "@/features/guests/page-data";
import { GuestForm } from "@/components/guests/guest-form";
import { BackToGuests } from "@/components/guests/guest-ui";
export const metadata: Metadata = { title: "Edit guest", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ guestId: string }> }) {
  const user = await requirePageUser(); if (!hasPermission(user.role, "guests:manage")) redirect("/guests");
  const [guest, families] = await Promise.all([getPageGuest((await params).guestId), guestFamilies()]);
  return <div className="mx-auto max-w-6xl space-y-6"><BackToGuests /><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Edit Guest</h1><GuestForm guest={guest} families={families} /></div>;
}
