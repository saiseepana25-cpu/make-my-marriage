import "server-only";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { AppError } from "@/lib/api/errors";
import { getTask } from "./service";
import { getEvent } from "@/features/events/service";
import type { WeddingEvent } from "@/features/events/types";

export async function getPageTask(id: string) {
  await requirePageUser();
  try {
    const task = await getTask(id);
    let event: WeddingEvent | undefined;
    if (task.eventId) {
      try { event = await getEvent(task.eventId); }
      catch (error) { if (!(error instanceof AppError && error.status === 404)) throw error; }
    }
    return { task, event, asOf: Date.now() };
  }
  catch (error) { if (error instanceof AppError && (error.status === 400 || error.status === 404)) notFound(); throw error; }
}
