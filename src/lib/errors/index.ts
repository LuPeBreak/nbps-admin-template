export type ActionErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code: ActionErrorCode } };
