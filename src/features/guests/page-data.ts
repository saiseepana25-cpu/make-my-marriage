import "server-only";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { AppError } from "@/lib/api/errors";
import { getGuest } from "./service";
export async function getPageGuest(id: string) {
  await requirePageUser();
  try { return await getGuest(id); }
  catch (error) { if (error instanceof AppError && (error.status === 400 || error.status === 404)) notFound(); throw error; }
}
