export type ApiErrorCode =
  | "VALIDATION_ERROR" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND"
  | "CONFLICT" | "RATE_LIMITED" | "UPLOAD_ERROR" | "INTERNAL_ERROR" | "SERVICE_UNAVAILABLE";

export type ApiResponse<T> =
  | { success: true; data: T; message: string; error: null }
  | { success: false; data: null; message: string; error: { code: ApiErrorCode; details: string[] } };

