import { AuthenticatedUser, SharedAccess, SharingService, ShareRole, ShareStatus } from "../types";
import { createUserDatabaseClient, DatabaseClient } from "../supabase/database";

type DatabaseClientFactory = (user: AuthenticatedUser) => DatabaseClient;
type Row = Record<string, unknown>;

function toNumber(value: unknown, fallback = 1): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mapSharedAccess(row: Row): SharedAccess {
  return {
    id: String(row.id),
    owner_user_id: String(row.owner_user_id),
    shared_with_user_id: row.shared_with_user_id ? String(row.shared_with_user_id) : "",
    shared_with_email: String(row.shared_with_email),
    role: row.role as ShareRole,
    status: row.status as ShareStatus,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    version: toNumber(row.server_version),
  };
}

export class SupabaseSharingService implements SharingService {
  constructor(
    private readonly createDatabaseClient: DatabaseClientFactory = createUserDatabaseClient
  ) {}

  async listByOwner(user: AuthenticatedUser): Promise<SharedAccess[]> {
    const db = this.createDatabaseClient(user);
    const rows = await db.findMany(
      "shared_access",
      { owner_user_id: user.id },
      { orderBy: { column: "created_at", ascending: false } }
    );
    return rows.map(mapSharedAccess);
  }

  async createInvite(
    user: AuthenticatedUser,
    input: { email: string; role: ShareRole }
  ): Promise<SharedAccess> {
    const db = this.createDatabaseClient(user);
    const now = new Date().toISOString();
    const row = await db.insertOne("shared_access", {
      owner_user_id: user.id,
      shared_with_user_id: null,
      shared_with_email: input.email,
      role: input.role,
      status: "pending",
      server_version: 1,
      created_at: now,
      updated_at: now,
    });

    return mapSharedAccess(row);
  }

  async revoke(user: AuthenticatedUser, id: string): Promise<SharedAccess> {
    const db = this.createDatabaseClient(user);
    const current = await db.findOne("shared_access", { id, owner_user_id: user.id });
    if (!current) {
      throw new Error("Share not found");
    }

    const serverVersion = toNumber(current.server_version) + 1;
    const row = await db.updateOne(
      "shared_access",
      {
        status: "revoked",
        server_version: serverVersion,
        updated_at: new Date().toISOString(),
      },
      { id, owner_user_id: user.id }
    );

    return mapSharedAccess(row);
  }
}
