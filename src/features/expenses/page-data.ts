import "server-only";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { getEvent } from "@/features/events/service";
import { AppError } from "@/lib/api/errors";
import type { WeddingEvent } from "@/features/events/types";
import { getExpense } from "./service";
export async function getPageExpense(id: string) {
  await requirePageUser();
  try {
    const expense = await getExpense(id); let event: WeddingEvent | undefined;
    if (expense.eventId) {
      try { event = await getEvent(expense.eventId); }
      catch (error) { if (!(error instanceof AppError && error.status === 404)) throw error; }
    }
    return { expense, event };
  } catch (error) { if (error instanceof AppError && (error.status === 400 || error.status === 404)) notFound(); throw error; }
}
