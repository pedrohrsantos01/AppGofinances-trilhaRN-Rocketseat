import { AppErrorCode, ApiEnvelope } from "../types";

export function ok<T>(data: T, meta: Record<string, unknown> = {}): ApiEnvelope<T> {
  return {
    data,
    error: null,
    meta: {
      service: "gofinances-api",
      ...meta,
    },
  };
}

export function fail(
  code: AppErrorCode,
  message: string,
  meta: Record<string, unknown> = {}
): ApiEnvelope<never> {
  return {
    data: null,
    error: { code, message },
    meta: {
      service: "gofinances-api",
      ...meta,
    },
  };
}
