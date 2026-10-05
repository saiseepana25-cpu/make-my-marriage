import "server-only";
import { notFound } from "next/navigation";
import { AppError } from "@/lib/api/errors";
import { requirePageUser } from "@/features/auth/current-user";
import { getEvent } from "./service";

export async function getPageEvent(id: string) {
  await requirePageUser();
  try { return { event: await getEvent(id), asOf: Date.now() }; }
  catch (error) {
    if (error instanceof AppError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}
