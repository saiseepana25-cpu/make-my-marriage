import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { parseExpenseInput, parseBudgetInput, validMoney } from "@/features/expenses/requests";
import { money, paymentStatus } from "@/features/expenses/format";
import { BudgetMetrics } from "@/components/expenses/expense-ui";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { BudgetForm } from "@/components/expenses/budget-form";
import type { BudgetSummary } from "@/features/expenses/types";
const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const summary: BudgetSummary = { totalBudget: 0, totalExpenses: 650000, totalPaid: 450000, outstanding: 200000, remainingBudget: -650000, utilization: null, expenseCount: 4, categories: [], events: [], paymentStatuses: [] };
test("expense validation accepts custom categories and excludes unapproved scope/status fields", () => {
  const input = parseExpenseInput({ name: " Venue ", category: " Custom ", amount: 123.45, weddingId: "forged", paymentStatus: "PAID", paidByUserId: "forged", receipt: "x" });
  expect(input).toMatchObject({ name: "Venue", category: "Custom", paidAmount: 0 });
  expect(input).not.toHaveProperty("weddingId"); expect(input).not.toHaveProperty("paymentStatus");
  for (const amount of [0, 0.000000001, -1, NaN, Infinity, "100", 1.234, Number.MAX_VALUE]) expect(() => parseExpenseInput({ name: "x", category: "Venue", amount })).toThrow();
  expect(validMoney(0.29)).toBe(true); expect(validMoney(0.1 + 0.2)).toBe(true);
  expect(parseExpenseInput({ name: "Decimal", category: "Gifts", amount: 0.3, paidAmount: 0.1 + 0.2 })).toMatchObject({ amount: 0.3, paidAmount: 0.3 });
  for (const paidAmount of [-1, 101, 1.111, null]) expect(() => parseExpenseInput({ name: "x", category: "Venue", amount: 100, paidAmount })).toThrow();
});
test("budget zero is explicit and payment status follows total/paid amounts", () => {
  expect(parseBudgetInput({ totalBudget: 0 })).toBe(0);
  for (const totalBudget of [null, "0", -1, Infinity, 0.001]) expect(() => parseBudgetInput({ totalBudget })).toThrow();
  expect([paymentStatus(100, 0), paymentStatus(100, 50), paymentStatus(100, 100)]).toEqual(["UNPAID", "PARTIALLY_PAID", "PAID"]);
  expect(money(650000)).toBe("₹6,50,000"); expect(money(0.29)).toBe("₹0.29");
});
test("zero budget displays a positive over-budget value and unavailable utilization", () => {
  render(<BudgetMetrics summary={summary} />);
  expect(screen.getByText("Over budget by", { exact: true })).toBeInTheDocument();
  expect(screen.queryByText("-₹6,50,000")).not.toBeInTheDocument();
  expect(screen.getByText("Unavailable", { exact: true })).toBeInTheDocument(); expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});
test("expense form rejects invalid amounts before saving and retains failed inputs", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Offline"));
  render(<ExpenseForm events={[]} />);
  fireEvent.click(screen.getByRole("button", { name: "Add expense" })); expect(screen.getByLabelText(/Expense name/)).toHaveFocus();
  fireEvent.change(screen.getByLabelText(/Expense name/), { target: { value: "Venue booking" } });
  fireEvent.change(screen.getByLabelText(/Category/), { target: { value: "Venue" } });
  fireEvent.change(screen.getByLabelText(/Total amount/), { target: { value: "100" } });
  fireEvent.change(screen.getByLabelText(/Paid amount/), { target: { value: "101" } });
  fireEvent.click(screen.getByRole("button", { name: "Add expense" })); expect(screen.getByLabelText(/Paid amount/)).toHaveFocus(); expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Paid amount/), { target: { value: "50" } }); fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Your details are still here"));
  expect(screen.getByLabelText(/Expense name/)).toHaveValue("Venue booking");
  expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toMatchObject({ amount: 100, paidAmount: 50, eventId: null });
});
test("expense persistence locks duplicate submission until navigation completes", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data: { id: "000000000000000000000001" } }), { status: 201 }));
  render(<ExpenseForm events={[]} />);
  fireEvent.change(screen.getByLabelText(/Expense name/), { target: { value: "Venue" } }); fireEvent.change(screen.getByLabelText(/Category/), { target: { value: "Venue" } }); fireEvent.change(screen.getByLabelText(/Total amount/), { target: { value: "100" } });
  fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/budget/expenses/000000000000000000000001?saved=created"));
  fireEvent.submit(screen.getByRole("button", { name: "Saving…" }).closest("form")!); expect(fetch).toHaveBeenCalledTimes(1);
});
test("budget form allows zero and keeps the entered value after failure", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Offline")); render(<BudgetForm summary={summary} />);
  fireEvent.click(screen.getByRole("button", { name: "Save budget" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Your amount is still here"));
  expect(screen.getByLabelText("Total wedding budget (₹)")).toHaveValue(0);
  expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toEqual({ totalBudget: 0 });
});
