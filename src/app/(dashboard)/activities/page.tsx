import type { Metadata } from "next";
import { requirePageUser } from "@/features/auth/current-user";
import { ActivityOverview } from "@/components/activities/activity-overview";
export const metadata: Metadata = { title: "Activities", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requirePageUser();
  return <ActivityOverview deleted={(await searchParams).deleted === "1"} />;
}
