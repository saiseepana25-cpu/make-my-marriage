import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getPageEvent } from "@/features/events/page-data";
import { EventForm } from "@/components/events/event-form";
import { BackToEvents } from "@/components/events/event-ui";

export const metadata: Metadata = { title: "Edit event", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ eventId: string }> }) {
  const user = await requirePageUser();
  if (!hasPermission(user.role, "events:manage")) redirect("/events");
  const { event } = await getPageEvent((await params).eventId);
  return <div className="mx-auto max-w-4xl space-y-6"><BackToEvents />
    <div><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Edit wedding event</h1><p className="mt-3 text-sm text-on-surface-variant">Keep your family up to date with the latest ceremony details.</p></div>
    <EventForm event={event} />
  </div>;
}
