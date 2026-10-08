import type { Metadata } from "next";
import { requirePageUser } from "@/features/auth/current-user";
import { activityEventOptions } from "@/features/activities/service";
import { ActivityForm } from "@/components/activities/activity-form";
import { BackToActivities } from "@/components/activities/activity-ui";
export const metadata: Metadata = { title: "Add update", robots: { index: false, follow: false } };
export default async function Page() {
  const user = await requirePageUser();
  const events = await activityEventOptions();
  return <div className="mx-auto max-w-6xl space-y-6"><BackToActivities /><ActivityForm events={events} authorName={user.name} /></div>;
}
