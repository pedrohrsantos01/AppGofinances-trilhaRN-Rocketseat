import { SharedAccess, ShareRole } from "../../../shared/domain/entities/SharedAccess";

/**
 * Checks if a user can read data owned by ownerUserId.
 * Owner always can. Accepted viewers and editors can.
 */
export function canUserRead(userId: string, ownerUserId: string, shares: SharedAccess[]): boolean {
  if (userId === ownerUserId) return true;

  return shares.some(
    (s) =>
      s.shared_with_user_id === userId &&
      s.status === "accepted" &&
      (s.role === "viewer" || s.role === "editor")
  );
}

/**
 * Checks if a user can edit data owned by ownerUserId.
 * Owner and accepted editors can.
 */
export function canUserEdit(userId: string, ownerUserId: string, shares: SharedAccess[]): boolean {
  if (userId === ownerUserId) return true;

  return shares.some(
    (s) => s.shared_with_user_id === userId && s.status === "accepted" && s.role === "editor"
  );
}

/**
 * Checks if userId is the owner of the data.
 */
export function isOwner(userId: string, ownerUserId: string): boolean {
  return userId === ownerUserId;
}

/**
 * Validates an invite before sending.
 */
export function validateInvite(email: string, role: ShareRole): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: "Informe um email valido" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Formato de email invalido" };
  }

  if (role === "owner") {
    return { valid: false, error: "Nao e possivel convidar como owner" };
  }

  return { valid: true };
}

/**
 * Returns only accepted (active) shares.
 */
export function getActiveShares(shares: SharedAccess[]): SharedAccess[] {
  return shares.filter((s) => s.status === "accepted");
}
