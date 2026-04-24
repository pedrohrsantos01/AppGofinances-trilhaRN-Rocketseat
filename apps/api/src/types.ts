export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "SYNC_CONFLICT"
  | "PROVIDER_ERROR"
  | "NETWORK_ERROR";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export interface ApiEnvelope<T> {
  data: T | null;
  error: { code: AppErrorCode; message: string } | null;
  meta: Record<string, unknown>;
}

export type SyncEntityType =
  | "accounts"
  | "credit_cards"
  | "transactions"
  | "invoices"
  | "budgets"
  | "reminders"
  | "goals";

export interface SyncMutation {
  id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown> | null;
  idempotency_key: string;
  device_id: string;
  created_at: string;
}

export interface SyncRemoteChange {
  entity_type: SyncEntityType;
  entity_id: string;
  payload: Record<string, unknown> | null;
  server_version: number;
  updated_at: string;
  deleted_at: string | null;
}

export interface SyncPushResult {
  accepted: { id: string; entity_id: string; server_version: number }[];
  conflicts: { id: string; entity_id: string; reason: string }[];
}

export interface SyncPullResult {
  changes: SyncRemoteChange[];
  cursor: string;
}

export interface SyncService {
  push(user: AuthenticatedUser, mutations: SyncMutation[]): Promise<SyncPushResult>;
  pull(user: AuthenticatedUser, since?: string): Promise<SyncPullResult>;
}

export type ShareRole = "editor" | "viewer";
export type ShareStatus = "pending" | "accepted" | "rejected" | "revoked";

export interface SharedAccess {
  id: string;
  owner_user_id: string;
  shared_with_user_id: string;
  shared_with_email: string;
  role: ShareRole;
  status: ShareStatus;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface SharingService {
  listByOwner(user: AuthenticatedUser): Promise<SharedAccess[]>;
  createInvite(
    user: AuthenticatedUser,
    input: { email: string; role: ShareRole }
  ): Promise<SharedAccess>;
  revoke(user: AuthenticatedUser, id: string): Promise<SharedAccess>;
}
