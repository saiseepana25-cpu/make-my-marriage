import { dateTimeFields } from "@/features/events/dates";

// Wedding dates are calendar dates stored at midnight UTC. Today follows India time.
export function weddingCountdown(weddingDate: string, now: number) {
  const today = dateTimeFields(new Date(now).toISOString()).date;
  const days = Math.round((Date.parse(weddingDate.slice(0, 10)) - Date.parse(today)) / 86_400_000);
  return days > 0 ? `${days} ${days === 1 ? "day" : "days"} to go`
    : days === 0 ? "Today is your wedding day" : "Our wedding";
}
export function completionPercentage(completed: number, total: number) {
  return total === 0 ? 0 : Math.round(completed / total * 100);
}
