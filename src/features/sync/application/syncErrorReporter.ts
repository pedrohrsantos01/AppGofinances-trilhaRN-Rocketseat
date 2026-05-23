export interface SyncErrorContext {
  entityType: string;
  entityId: string;
  operation: "insert" | "update" | "delete";
}

export type SyncErrorReporter = (error: unknown, context: SyncErrorContext) => void;

const defaultReporter: SyncErrorReporter = (error, context) => {
  console.error(
    `[sync] enqueue failed for ${context.entityType}:${context.entityId} (${context.operation})`,
    error
  );
};

let reporter: SyncErrorReporter = defaultReporter;

export function setSyncErrorReporter(next: SyncErrorReporter): void {
  reporter = next;
}

export function resetSyncErrorReporter(): void {
  reporter = defaultReporter;
}

export function reportSyncError(error: unknown, context: SyncErrorContext): void {
  reporter(error, context);
}
