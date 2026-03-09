import { AppError } from "../../../shared/domain/errors/AppError";

describe("AppError", () => {
  it("should create error with code and message", () => {
    const error = new AppError("VALIDATION_ERROR", "Invalid amount");

    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid amount");
    expect(error.name).toBe("AppError");
    expect(error.originalError).toBeUndefined();
  });

  it("should preserve original error", () => {
    const original = new Error("disk full");
    const error = new AppError("STORAGE_ERROR", "Failed to save", original);

    expect(error.code).toBe("STORAGE_ERROR");
    expect(error.originalError).toBe(original);
  });

  it("should be instanceof Error", () => {
    const error = new AppError("NOT_FOUND", "Not found");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it("should support all error codes", () => {
    const codes = [
      "VALIDATION_ERROR",
      "SYNC_CONFLICT",
      "AUTH_REQUIRED",
      "PROVIDER_ERROR",
      "STORAGE_ERROR",
      "NETWORK_ERROR",
      "NOT_FOUND",
    ] as const;

    codes.forEach((code) => {
      const error = new AppError(code, `Error: ${code}`);
      expect(error.code).toBe(code);
    });
  });
});
