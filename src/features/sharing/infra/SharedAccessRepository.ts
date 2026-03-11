import { SharedAccess } from "../../../shared/domain/entities/SharedAccess";
import { getSupabaseClient } from "../../../shared/infra/supabase/client";

/**
 * Repository for shared access records.
 * Uses Supabase directly since sharing is inherently a cloud feature.
 */
export class SharedAccessRepository {
  async create(share: SharedAccess): Promise<SharedAccess> {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase nao configurado para compartilhamento");

    const { data, error } = await client.from("shared_access").insert(share).select().single();

    if (error) throw error;
    return data as SharedAccess;
  }

  async update(share: SharedAccess): Promise<SharedAccess> {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase nao configurado para compartilhamento");

    const { data, error } = await client
      .from("shared_access")
      .update({ ...share, updated_at: new Date().toISOString(), version: share.version + 1 })
      .eq("id", share.id)
      .select()
      .single();

    if (error) throw error;
    return data as SharedAccess;
  }

  async listByOwner(ownerId: string): Promise<SharedAccess[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from("shared_access")
      .select("*")
      .eq("owner_user_id", ownerId);

    if (error) throw error;
    return (data ?? []) as SharedAccess[];
  }

  async listSharedWithMe(userId: string): Promise<SharedAccess[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from("shared_access")
      .select("*")
      .eq("shared_with_user_id", userId)
      .eq("status", "accepted");

    if (error) throw error;
    return (data ?? []) as SharedAccess[];
  }
}
