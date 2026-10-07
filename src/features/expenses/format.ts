import type { PaymentStatus } from "@/types/domain";

export const expenseCategories = ["Venue", "Catering", "Decoration", "Photography", "Clothing", "Jewellery", "Makeup", "Entertainment", "Invitations", "Gifts", "Miscellaneous"];
export const paymentLabels: Record<PaymentStatus, string> = { UNPAID: "Unpaid", PARTIALLY_PAID: "Partially paid", PAID: "Paid" };
export function paymentStatus(amount: number, paid: number): PaymentStatus {
  return paid === 0 ? "UNPAID" : paid === amount ? "PAID" : "PARTIALLY_PAID";
}
export function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value).replace(/\.00$/, "");
}
export function roundedMoney(value: number) { return Math.round(value * 100) / 100; }
export function expenseTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value));
}
