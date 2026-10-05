import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { EventForm } from "@/components/events/event-form";
import { BackToEvents } from "@/components/events/event-ui";

export const metadata: Metadata = { title: "Add event", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  const user = await requirePageUser();
  if (!hasPermission(user.role, "events:manage")) redirect("/events");
  const params = await searchParams;
  return <div className="mx-auto max-w-4xl space-y-6"><BackToEvents />
    <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Your celebration, thoughtfully planned</p><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Add a wedding event</h1><p className="mt-3 text-sm text-on-surface-variant">Bring another meaningful moment into your family’s wedding calendar.</p></div>
    <EventForm suggestedName={typeof params.name === "string" ? params.name.slice(0, 150) : ""} />
  </div>;
}
