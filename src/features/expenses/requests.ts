import { isRecord, requireObjectId, validationError } from "@/lib/api/validation";
import type { ExpenseInput } from "./types";
import { roundedMoney } from "./format";

const fields = ["name", "category", "amount", "paidAmount", "eventId", "paidByName", "notes"] as const;
export function expensePatch(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) validationError("Expense details must be an object.");
  return Object.fromEntries(fields.filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
}
export function validMoney(value: unknown, positive = false): value is number {
  return typeof value === "number" && Number.isFinite(value) && (positive ? value > 0 : value >= 0)
    && (!positive || Math.round(value * 100) > 0)
    && Number.isSafeInteger(Math.round(value * 100)) && Math.abs(value * 100 - Math.round(value * 100)) < 0.00001;
}
function text(value: unknown, label: string, max: number, required = false) {
  if (value == null || value === "") { if (required) validationError(`Enter ${label}.`); return undefined; }
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) validationError(`Enter ${label} (up to ${max} characters).`);
  return value.trim() || undefined;
}
export function parseExpenseInput(input: unknown): ExpenseInput {
  const values = expensePatch(input);
  const name = text(values.name, "an expense name", 120, true)!;
  const category = text(values.category, "a category", 80, true)!;
  if (!validMoney(values.amount, true)) validationError("Expense amount must be greater than zero, with at most two decimal places.");
  const amount = roundedMoney(values.amount);
  const paidAmount = values.paidAmount === undefined ? 0 : values.paidAmount;
  if (!validMoney(paidAmount) || roundedMoney(paidAmount) > amount) validationError("Paid amount must be between zero and the total expense amount, with at most two decimal places.");
  return { name, category, amount, paidAmount: roundedMoney(paidAmount),
    eventId: values.eventId == null || values.eventId === "" ? undefined : requireObjectId(values.eventId, "eventId"),
    paidByName: text(values.paidByName, "a payer name", 120), notes: text(values.notes, "notes", 5000) };
}
export function parseBudgetInput(input: unknown): number {
  if (!isRecord(input) || !validMoney(input.totalBudget)) validationError("Enter a budget of zero or more, with at most two decimal places.");
  return roundedMoney(input.totalBudget);
}
