"use client";
import { useState } from "react";
import { DashboardTasksSection, DashboardEventsSection } from "./dashboard-sections";
import { DashboardActivities } from "./dashboard-activities";
export function DashboardPlanning({ canAddTasks, canAddEvents }: { canAddTasks: boolean; canAddEvents: boolean }) {
  const [activityRevision, setActivityRevision] = useState(0);
  return <><DashboardTasksSection canAdd={canAddTasks} onTaskUpdated={() => setActivityRevision(value => value + 1)} /><DashboardEventsSection canAdd={canAddEvents} /><DashboardActivities key={activityRevision} /></>;
}
