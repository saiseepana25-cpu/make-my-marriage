import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { guestFamilies } from "@/features/guests/service";
import { GuestForm } from "@/components/guests/guest-form";
import { BackToGuests } from "@/components/guests/guest-ui";
export const metadata: Metadata = { title: "Add guest", robots: { index: false, follow: false } };
export default async function Page() {
  const user = await requirePageUser(); if (!hasPermission(user.role, "guests:manage")) redirect("/guests");
  const families = await guestFamilies();
  return <div className="mx-auto max-w-6xl space-y-6"><BackToGuests /><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Add New Guest</h1><GuestForm families={families} /></div>;
}
