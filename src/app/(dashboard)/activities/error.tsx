"use client";
import { ActivityFailure } from "@/components/activities/activity-failure";
import { BackToActivities } from "@/components/activities/activity-ui";
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) { return <div className="space-y-6"><BackToActivities /><ActivityFailure expired={false} retry={retry} /></div>; }
