import type { Metadata } from "next";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getCurrentWedding } from "@/features/weddings/service";
import { GuestOverview } from "@/components/guests/guest-overview";
export const metadata: Metadata = { title: "Guests", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const user = await requirePageUser();
  const [wedding, search] = await Promise.all([getCurrentWedding(), searchParams]);
  return <GuestOverview manage={hasPermission(user.role, "guests:manage")} couple={`${wedding.groomName} & ${wedding.brideName}`} deleted={search.deleted === "1"} />;
}
