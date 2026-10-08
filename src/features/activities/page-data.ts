import "server-only";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/features/auth/current-user";
import { AppError } from "@/lib/api/errors";
import { getActivity } from "./service";
export async function getPageActivity(id: string) {
  await requirePageUser();
  try { return await getActivity(id); }
  catch (error) { if (error instanceof AppError && (error.status === 400 || error.status === 404)) notFound(); throw error; }
}
