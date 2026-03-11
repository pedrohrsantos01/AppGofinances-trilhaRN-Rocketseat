import { SharedAccess } from "../../../../shared/domain/entities/SharedAccess";
import {
  canUserRead,
  canUserEdit,
  isOwner,
  validateInvite,
  getActiveShares,
} from "../../../../features/sharing/domain/sharingRules";

function makeShare(overrides: Partial<SharedAccess>): SharedAccess {
  return {
    id: "share-1",
    owner_user_id: "owner-1",
    shared_with_user_id: "viewer-1",
    shared_with_email: "viewer@test.com",
    role: "viewer",
    status: "accepted",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
    ...overrides,
  };
}

describe("sharingRules", () => {
  describe("canUserRead", () => {
    it("should allow owner to read", () => {
      const shares: SharedAccess[] = [];
      expect(canUserRead("owner-1", "owner-1", shares)).toBe(true);
    });

    it("should allow accepted viewer to read", () => {
      const shares: SharedAccess[] = [
        makeShare({ shared_with_user_id: "viewer-1", role: "viewer", status: "accepted" }),
      ];
      expect(canUserRead("viewer-1", "owner-1", shares)).toBe(true);
    });

    it("should allow accepted editor to read", () => {
      const shares: SharedAccess[] = [
        makeShare({ shared_with_user_id: "editor-1", role: "editor", status: "accepted" }),
      ];
      expect(canUserRead("editor-1", "owner-1", shares)).toBe(true);
    });

    it("should deny pending invite", () => {
      const shares: SharedAccess[] = [
        makeShare({ shared_with_user_id: "pending-1", status: "pending" }),
      ];
      expect(canUserRead("pending-1", "owner-1", shares)).toBe(false);
    });

    it("should deny revoked access", () => {
      const shares: SharedAccess[] = [
        makeShare({ shared_with_user_id: "revoked-1", status: "revoked" }),
      ];
      expect(canUserRead("revoked-1", "owner-1", shares)).toBe(false);
    });

    it("should deny unrelated user", () => {
      const shares: SharedAccess[] = [];
      expect(canUserRead("stranger", "owner-1", shares)).toBe(false);
    });
  });

  describe("canUserEdit", () => {
    it("should allow owner to edit", () => {
      expect(canUserEdit("owner-1", "owner-1", [])).toBe(true);
    });

    it("should allow accepted editor to edit", () => {
      const shares: SharedAccess[] = [
        makeShare({ shared_with_user_id: "editor-1", role: "editor", status: "accepted" }),
      ];
      expect(canUserEdit("editor-1", "owner-1", shares)).toBe(true);
    });

    it("should deny viewer from editing", () => {
      const shares: SharedAccess[] = [
        makeShare({ shared_with_user_id: "viewer-1", role: "viewer", status: "accepted" }),
      ];
      expect(canUserEdit("viewer-1", "owner-1", shares)).toBe(false);
    });
  });

  describe("isOwner", () => {
    it("should return true for owner", () => {
      expect(isOwner("user-1", "user-1")).toBe(true);
    });

    it("should return false for non-owner", () => {
      expect(isOwner("user-2", "user-1")).toBe(false);
    });
  });

  describe("validateInvite", () => {
    it("should accept valid email and role", () => {
      const result = validateInvite("test@email.com", "viewer");
      expect(result.valid).toBe(true);
    });

    it("should reject empty email", () => {
      const result = validateInvite("", "viewer");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("email");
    });

    it("should reject invalid email format", () => {
      const result = validateInvite("not-an-email", "viewer");
      expect(result.valid).toBe(false);
    });

    it("should reject owner role in invite", () => {
      const result = validateInvite("test@email.com", "owner");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("owner");
    });

    it("should accept editor role", () => {
      const result = validateInvite("test@email.com", "editor");
      expect(result.valid).toBe(true);
    });
  });

  describe("getActiveShares", () => {
    it("should filter only accepted shares", () => {
      const shares: SharedAccess[] = [
        makeShare({ id: "1", status: "accepted" }),
        makeShare({ id: "2", status: "pending" }),
        makeShare({ id: "3", status: "revoked" }),
        makeShare({ id: "4", status: "accepted" }),
      ];

      const active = getActiveShares(shares);
      expect(active).toHaveLength(2);
      expect(active.map((s) => s.id)).toEqual(["1", "4"]);
    });

    it("should return empty for no shares", () => {
      expect(getActiveShares([])).toHaveLength(0);
    });
  });
});
