import "server-only";
import mongoose from "mongoose";
import { requirePermission, weddingScope } from "@/features/auth/authorization";
import { AppError } from "@/lib/api/errors";
import { pagination, requireObjectId, validationError } from "@/lib/api/validation";
import { EventModel } from "@/models/event";
import { ExpenseModel, type ExpenseRecord } from "@/models/expense";
import { WeddingModel } from "@/models/wedding";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";
import { PAYMENT_STATUSES, type CurrentUser, type PaymentStatus } from "@/types/domain";
import { paymentStatus, roundedMoney } from "./format";
import { expensePatch, parseBudgetInput, parseExpenseInput } from "./requests";
import type { BudgetSummary, ExpenseList, WeddingExpense } from "./types";

function serialize(expense: ExpenseRecord & { _id: mongoose.Types.ObjectId }): WeddingExpense {
  const paidAmount = expense.paidAmount ?? 0;
  return { id: expense._id.toString(), name: expense.name, category: expense.category,
    amount: expense.amount, paidAmount, outstanding: roundedMoney(expense.amount - paidAmount),
    paymentStatus: paymentStatus(expense.amount, paidAmount), eventId: expense.eventId?.toString(),
    paidByName: expense.paidByName ?? undefined, notes: expense.notes ?? undefined,
    createdAt: expense.createdAt.toISOString(), updatedAt: expense.updatedAt.toISOString() };
}
const missing = () => new AppError("NOT_FOUND", "This expense could not be found in your wedding workspace.", 404);
let indexes: Promise<void> | undefined;
async function expenseUser(permission: "expenses:read" | "expenses:manage" | "budget:read" | "budget:manage") {
  const user = await requirePermission(permission);
  // Provision only the existing documented index, lazily, also with production autoIndex=false.
  indexes ??= ExpenseModel.createIndexes().then(() => undefined).catch(error => { indexes = undefined; throw error; });
  await indexes;
  return user;
}
async function limit(user: CurrentUser) {
  await enforceRateLimit({ scope: "expenses", key: `user:${user.id}`, limit: 60, windowSeconds: 60 });
}
export async function expenseEventOptions() {
  const user = await expenseUser("expenses:read");
  const events = await EventModel.find(weddingScope(user)).select("_id name").sort({ startAt: 1, _id: 1 }).lean();
  return events.map(event => ({ id: event._id.toString(), name: event.name }));
}
export async function listExpenses(search = new URLSearchParams()): Promise<ExpenseList> {
  const user = await expenseUser("expenses:read");
  const { page, limit: pageLimit, skip } = pagination(search);
  const scope = weddingScope(user);
  const filter: mongoose.QueryFilter<ExpenseRecord> = { ...scope };
  const status = search.get("paymentStatus"), event = search.get("eventId"), category = search.get("category"), q = search.get("search")?.trim();
  if (status) {
    if (!PAYMENT_STATUSES.includes(status as PaymentStatus)) validationError("Choose a valid payment status.");
    filter.paymentStatus = status as PaymentStatus;
  }
  if (event) filter.eventId = event === "wedding-wide" ? { $exists: false } : requireObjectId(event, "eventId");
  if (category) { if (category.length > 80) validationError("Category must be at most 80 characters."); filter.category = category; }
  if (q) { if (q.length > 120) validationError("Search must be at most 120 characters."); filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" }; }
  const [expenses, total, events, categories] = await Promise.all([
    ExpenseModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(pageLimit).lean(),
    ExpenseModel.countDocuments(filter), expenseEventOptions(), ExpenseModel.distinct("category", scope),
  ]);
  return { expenses: expenses.map(serialize), events, categories: categories.sort(),
    pagination: { page, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) } };
}
export async function getExpense(id: string) {
  const user = await expenseUser("expenses:read");
  const expense = await ExpenseModel.findOne({ ...weddingScope(user), _id: requireObjectId(id, "expenseId") }).lean();
  if (!expense) throw missing();
  return serialize(expense);
}
async function lockEvent(eventId: string | undefined, user: CurrentUser, session: mongoose.ClientSession) {
  if (!eventId) return;
  const filter = { ...weddingScope(user), _id: eventId };
  const event = await EventModel.findOne(filter).select("updatedAt").session(session).lean();
  if (!event) validationError("Choose an existing event from your wedding workspace.");
  // Serialize linking against the existing transactional event deletion/unlinking flow.
  await EventModel.updateOne(filter, { $set: { updatedAt: new Date(Math.max(Date.now(), event.updatedAt.getTime() + 1)) } }, { session, timestamps: false });
}
export async function createExpense(input: unknown) {
  const user = await expenseUser("expenses:manage"); await limit(user);
  const data = parseExpenseInput(input);
  return mongoose.connection.transaction(async session => {
    await lockEvent(data.eventId, user, session);
    const [expense] = await ExpenseModel.create([{ ...data, paymentStatus: paymentStatus(data.amount, data.paidAmount), ...weddingScope(user), createdBy: user.id }], { session });
    return serialize(expense.toObject());
  });
}
export async function updateExpense(id: string, input: unknown) {
  const user = await expenseUser("expenses:manage"); await limit(user);
  const expenseId = requireObjectId(id, "expenseId"), patch = expensePatch(input);
  return mongoose.connection.transaction(async session => {
    const expense = await ExpenseModel.findOne({ ...weddingScope(user), _id: expenseId }).session(session);
    if (!expense) throw missing();
    const data = parseExpenseInput({ ...serialize(expense.toObject()), ...patch });
    await lockEvent(data.eventId, user, session);
    expense.set({ ...data, paymentStatus: paymentStatus(data.amount, data.paidAmount) });
    await expense.save({ session }); return serialize(expense.toObject());
  });
}
export async function deleteExpense(id: string) {
  const user = await expenseUser("expenses:manage"); await limit(user);
  const result = await ExpenseModel.deleteOne({ ...weddingScope(user), _id: requireObjectId(id, "expenseId") });
  if (!result.deletedCount) throw missing();
}
interface Group { _id: string | mongoose.Types.ObjectId | null; amount: number; paidAmount: number; count: number }
interface Aggregate { totals: Group[]; categories: Group[]; events: Group[]; statuses: Group[] }
export async function budgetSummary(): Promise<BudgetSummary> {
  const user = await expenseUser("budget:read");
  const group = (id: string | null) => ({ $group: { _id: id, amount: { $sum: "$amount" }, paidAmount: { $sum: { $ifNull: ["$paidAmount", 0] } }, count: { $sum: 1 } } });
  const [wedding, results, events] = await Promise.all([
    WeddingModel.findById(user.weddingId).select("totalBudget").lean(),
    ExpenseModel.aggregate<Aggregate>([{ $match: { weddingId: new mongoose.Types.ObjectId(user.weddingId) } },
      { $facet: { totals: [group(null)], categories: [group("$category"), { $sort: { amount: -1, _id: 1 } }],
        events: [group("$eventId"), { $sort: { amount: -1, _id: 1 } }], statuses: [group("$paymentStatus")] } }]),
    expenseEventOptions(),
  ]);
  if (!wedding) throw new AppError("NOT_FOUND", "Your wedding workspace could not be found.", 404);
  const totals = results[0]?.totals[0];
  const totalExpenses = roundedMoney(totals?.amount ?? 0), totalPaid = roundedMoney(totals?.paidAmount ?? 0);
  const totalBudget = wedding.totalBudget ?? null;
  const eventNames = new Map(events.map(event => [event.id, event.name]));
  const groups = (values: Group[], kind: "category" | "event" | "status") => values.map(value => ({
    label: kind === "event" ? (value._id ? eventNames.get(String(value._id)) ?? "Event unavailable" : "Wedding-wide") : String(value._id),
    ...(kind === "event" && value._id ? { id: String(value._id) } : {}), count: value.count,
    amount: roundedMoney(value.amount), paidAmount: roundedMoney(value.paidAmount), outstanding: roundedMoney(value.amount - value.paidAmount),
  }));
  return { totalBudget, totalExpenses, totalPaid, outstanding: roundedMoney(totalExpenses - totalPaid), expenseCount: totals?.count ?? 0,
    remainingBudget: totalBudget === null ? null : roundedMoney(totalBudget - totalExpenses),
    utilization: totalBudget === null || totalBudget === 0 ? null : Math.round(totalExpenses / totalBudget * 100),
    categories: groups(results[0]?.categories ?? [], "category"), events: groups(results[0]?.events ?? [], "event"), paymentStatuses: groups(results[0]?.statuses ?? [], "status") };
}
export async function updateBudget(input: unknown) {
  const user = await expenseUser("budget:manage"); await limit(user);
  const totalBudget = parseBudgetInput(input);
  const result = await WeddingModel.updateOne({ _id: user.weddingId }, { $set: { totalBudget } }, { runValidators: true });
  if (!result.matchedCount) throw new AppError("NOT_FOUND", "Your wedding workspace could not be found.", 404);
  return { totalBudget };
}
