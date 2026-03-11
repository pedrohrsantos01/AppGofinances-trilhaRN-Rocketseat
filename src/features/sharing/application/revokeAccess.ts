import { SharedAccess } from "../../../shared/domain/entities/SharedAccess";
import { SharedAccessRepository } from "../infra/SharedAccessRepository";

const repo = new SharedAccessRepository();

export async function revokeAccess(share: SharedAccess): Promise<SharedAccess> {
  return repo.update({ ...share, status: "revoked" });
}
