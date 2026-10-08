import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { getPageActivity } from "@/features/activities/page-data";
import { activityEventOptions } from "@/features/activities/service";
import { ActivityForm } from "@/components/activities/activity-form";
import { BackToActivities } from "@/components/activities/activity-ui";
export const metadata: Metadata = { title: "Edit update", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ activityId: string }> }) {
  const user = await requirePageUser(), activity = await getPageActivity((await params).activityId);
  if (!activity.canModify) redirect(`/activities/${activity.id}`);
  const events = await activityEventOptions();
  return <div className="mx-auto max-w-6xl space-y-6"><BackToActivities /><ActivityForm activity={activity} events={events} authorName={user.name} /></div>;
}
