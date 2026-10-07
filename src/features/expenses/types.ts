import type { PaymentStatus } from "@/types/domain";

export interface ExpenseInput {
  name: string;
  category: string;
  amount: number;
  paidAmount: number;
  eventId?: string;
  paidByName?: string;
  notes?: string;
}
export interface WeddingExpense extends ExpenseInput {
  id: string;
  paymentStatus: PaymentStatus;
  outstanding: number;
  createdAt: string;
  updatedAt: string;
}
export interface ExpenseEvent { id: string; name: string }
export interface ExpenseList {
  expenses: WeddingExpense[];
  events: ExpenseEvent[];
  categories: string[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
export interface ExpenseGroup {
  label: string;
  id?: string;
  count: number;
  amount: number;
  paidAmount: number;
  outstanding: number;
}
export interface BudgetSummary {
  totalBudget: number | null;
  totalExpenses: number;
  totalPaid: number;
  outstanding: number;
  remainingBudget: number | null;
  utilization: number | null;
  expenseCount: number;
  categories: ExpenseGroup[];
  events: ExpenseGroup[];
  paymentStatuses: ExpenseGroup[];
}
