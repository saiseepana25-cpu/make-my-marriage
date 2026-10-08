export const activityNotice = "Updates are attributed to the signed-in account. Everyone using shared credentials appears under that account’s name.";
export function activityTimestamp(value: string) {
  return `${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(value))} IST`;
}
function calendarDay(value: number) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(value));
}
export function activityDay(value: string, asOf: number) {
  const day = calendarDay(new Date(value).getTime());
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(value));
  return `${day === calendarDay(asOf) ? "Today · " : day === calendarDay(asOf - 86_400_000) ? "Yesterday · " : ""}${date}`;
}
