import { isRecord, requireObjectId, validationError } from "@/lib/api/validation";
import type { ActivityInput } from "./types";

const fields = ["title", "description", "relatedEventId", "activityType"] as const;
export function activityPatch(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) validationError("Update details must be an object.");
  return Object.fromEntries(fields.filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
}
function text(value: unknown, label: string, maximum: number, required = false) {
  if (value == null || value === "") {
    if (required) validationError("Enter a title.");
    return undefined;
  }
  if (typeof value !== "string" || value.length > maximum || (required && !value.trim())) {
    validationError(`${label} must ${required ? "contain text and " : ""}be at most ${maximum} characters.`);
  }
  return value.trim() || undefined;
}
export function parseActivityInput(input: unknown): ActivityInput {
  const values = activityPatch(input);
  return {
    title: text(values.title, "Title", 120, true)!,
    description: text(values.description, "Description", 5000),
    activityType: text(values.activityType, "Category", 80),
    relatedEventId: values.relatedEventId == null || values.relatedEventId === "" ? undefined : requireObjectId(values.relatedEventId, "relatedEventId"),
  };
}
