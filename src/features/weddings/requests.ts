import { parseWeddingSetupRequest } from "@/features/auth/requests";
import { isRecord, validationError } from "@/lib/api/validation";
import type { WeddingDetails } from "./types";

export const weddingDetailFields = ["groomName", "brideName", "weddingDate", "location"] as const;
export function parseWeddingPatch(input: unknown): Partial<WeddingDetails> {
  if (!isRecord(input)) validationError("Wedding details must be an object.");
  const patch = Object.fromEntries(weddingDetailFields.filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
  if (!Object.keys(patch).length) validationError("Enter wedding details to update.");
  // Validate supplied fields without reading/replacing unrelated persisted values.
  const parsed = parseWeddingSetupRequest({ groomName: "Groom", brideName: "Bride", weddingDate: "2000-01-01", location: "Location", ...patch });
  return Object.fromEntries(Object.keys(patch).map(key => [key, parsed[key as keyof WeddingDetails]]));
}
export function weddingDetailsErrors(values: WeddingDetails): Partial<Record<keyof WeddingDetails, string>> {
  const errors: Partial<Record<keyof WeddingDetails, string>> = {};
  for (const [key, label, maximum] of [["groomName", "the groom's name", 100], ["brideName", "the bride's name", 100], ["location", "your wedding location", 200]] as const) {
    if (!values[key].trim() || values[key].length > maximum) errors[key] = `Enter ${label} (up to ${maximum} characters).`;
  }
  try { parseWeddingSetupRequest({ ...values, groomName: "Groom", brideName: "Bride", location: "Location" }); }
  catch { errors.weddingDate = "Choose a valid wedding date."; }
  return errors;
}
