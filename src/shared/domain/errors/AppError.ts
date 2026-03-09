export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "SYNC_CONFLICT"
  | "AUTH_REQUIRED"
  | "PROVIDER_ERROR"
  | "STORAGE_ERROR"
  | "NETWORK_ERROR"
  | "NOT_FOUND";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly originalError?: unknown;

  constructor(code: AppErrorCode, message: string, originalError?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.originalError = originalError;
  }
}
