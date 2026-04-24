import { SharedAccess } from "../../../shared/domain/entities/SharedAccess";
import { ApiClient } from "../../../shared/infra/http/ApiClient";
import { createApiClient } from "../../../shared/infra/http/createApiClient";

type SharingApiClient = Pick<ApiClient, "request">;

export class SharedAccessRepository {
  constructor(private readonly client: SharingApiClient = createApiClient()) {}

  async create(share: SharedAccess): Promise<SharedAccess> {
    return this.client.request<SharedAccess>("/v1/sharing/invites", {
      method: "POST",
      body: {
        email: share.shared_with_email,
        role: share.role,
      },
    });
  }

  async update(share: SharedAccess): Promise<SharedAccess> {
    if (share.status === "revoked") {
      return this.client.request<SharedAccess>(`/v1/sharing/${share.id}/revoke`, {
        method: "PATCH",
      });
    }

    throw new Error("Atualizacao de compartilhamento nao suportada pelo BFF");
  }

  async listByOwner(ownerId: string): Promise<SharedAccess[]> {
    const shares = await this.client.request<SharedAccess[]>("/v1/sharing/invites");
    return shares.filter((share) => share.owner_user_id === ownerId);
  }

  async listSharedWithMe(userId: string): Promise<SharedAccess[]> {
    const shares = await this.client.request<SharedAccess[]>("/v1/sharing/invites");
    return shares.filter(
      (share) => share.shared_with_user_id === userId && share.status === "accepted"
    );
  }
}
