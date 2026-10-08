import type { RsvpStatus } from "@/types/domain";
export const attendanceLabels: Record<RsvpStatus, string> = { PENDING: "Pending", ATTENDING: "Attending", NOT_ATTENDING: "Not attending" };
export const guestNotice = "Attendance is updated by your family. Guest self-service RSVP and invitation sending are coming soon.";
export function guestTimestamp(value?: string) {
  return value ? `${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value))} IST` : "Not provided";
}
export function guestInitials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join("").toUpperCase(); }
