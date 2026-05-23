import {
  reportSyncError,
  setSyncErrorReporter,
  resetSyncErrorReporter,
  SyncErrorContext,
} from "../../../../features/sync/application/syncErrorReporter";

describe("syncErrorReporter", () => {
  afterEach(() => {
    resetSyncErrorReporter();
  });

  it("forwards error and context to the registered reporter", () => {
    const spy = jest.fn();
    setSyncErrorReporter(spy);

    const error = new Error("enqueue failed");
    const context: SyncErrorContext = {
      entityType: "transactions",
      entityId: "tx-1",
      operation: "insert",
    };
    reportSyncError(error, context);

    expect(spy).toHaveBeenCalledWith(error, context);
  });

  it("restores the default reporter (console.error) after reset", () => {
    const spy = jest.fn();
    setSyncErrorReporter(spy);
    resetSyncErrorReporter();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    reportSyncError(new Error("x"), {
      entityType: "transactions",
      entityId: "tx-1",
      operation: "delete",
    });

    expect(spy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });
});
