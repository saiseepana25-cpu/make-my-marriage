import { BackToBudget } from "@/components/expenses/expense-ui";
export default function NotFound() { return <div className="space-y-5 rounded-2xl bg-surface-container-lowest p-8"><h1 className="font-display-md text-3xl text-primary">Expense not found</h1><p className="text-secondary">This expense is no longer available in your wedding workspace.</p><BackToBudget /></div>; }
