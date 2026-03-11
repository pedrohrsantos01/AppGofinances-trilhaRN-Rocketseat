import { SharedAccess, ShareRole } from "../../../shared/domain/entities/SharedAccess";
import { AppError } from "../../../shared/domain/errors/AppError";
import { validateInvite } from "../domain/sharingRules";
import { SharedAccessRepository } from "../infra/SharedAccessRepository";

const repo = new SharedAccessRepository();

export async function inviteUser(
  ownerUserId: string,
  email: string,
  role: ShareRole
): Promise<SharedAccess> {
  const validation = validateInvite(email, role);
  if (!validation.valid) {
    throw new AppError("VALIDATION_ERROR", validation.error!);
  }

  const existing = await repo.listByOwner(ownerUserId);
  const duplicate = existing.find(
    (s) => s.shared_with_email === email && (s.status === "accepted" || s.status === "pending")
  );
  if (duplicate) {
    throw new AppError("VALIDATION_ERROR", "Este email ja compartilhado");
  }

  const share: SharedAccess = {
    id: `share-${Date.now()}`,
    owner_user_id: ownerUserId,
    shared_with_user_id: "",
    shared_with_email: email,
    role,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  };

  return repo.create(share);
}
