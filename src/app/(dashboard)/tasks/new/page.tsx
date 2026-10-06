import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getCurrentWedding } from "@/features/weddings/service";
import { taskEventOptions } from "@/features/tasks/service";
import { TaskForm } from "@/components/tasks/task-form";
import { BackToTasks } from "@/components/tasks/task-ui";
export const metadata: Metadata = { title: "Add task", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ title?: string }> }) {
  const user = await requirePageUser(); if (!hasPermission(user.role, "tasks:manage")) redirect("/tasks");
  const [wedding, events, params] = await Promise.all([getCurrentWedding(), taskEventOptions(), searchParams]);
  return <div className="mx-auto max-w-4xl space-y-6"><BackToTasks /><div><h1 className="font-display-md text-3xl text-primary sm:text-4xl">Add Task</h1><p className="mt-3 text-sm text-on-surface-variant">Create a preparation item for {wedding.groomName} &amp; {wedding.brideName}’s shared wedding checklist.</p></div><div className="mx-auto max-w-2xl"><TaskForm events={events} suggestedTitle={typeof params.title === "string" ? params.title.slice(0, 120) : ""} /></div></div>;
}
