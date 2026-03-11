import { SharedAccess } from "../../../../shared/domain/entities/SharedAccess";

import { inviteUser } from "../../../../features/sharing/application/inviteUser";
import { revokeAccess } from "../../../../features/sharing/application/revokeAccess";

const mockCreate = jest.fn().mockResolvedValue({} as SharedAccess);
const mockListByOwner = jest.fn().mockResolvedValue([]);
const mockUpdate = jest.fn().mockResolvedValue({} as SharedAccess);

jest.mock("../../../../features/sharing/infra/SharedAccessRepository", () => ({
  SharedAccessRepository: jest.fn(() => ({
    create: (...args: any[]) => mockCreate(...args),
    listByOwner: (...args: any[]) => mockListByOwner(...args),
    update: (...args: any[]) => mockUpdate(...args),
  })),
}));

describe("inviteUser", () => {
  beforeEach(() => {
    mockCreate.mockClear();
    mockListByOwner.mockClear();
  });

  it("should create a pending invite for valid email", async () => {
    mockCreate.mockResolvedValue({
      id: "share-1",
      owner_user_id: "owner-1",
      shared_with_email: "friend@test.com",
      role: "viewer",
      status: "pending",
    });

    const result = await inviteUser("owner-1", "friend@test.com", "viewer");
    expect(result.status).toBe("pending");
    expect(result.shared_with_email).toBe("friend@test.com");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("should reject invalid email", async () => {
    await expect(inviteUser("owner-1", "", "viewer")).rejects.toThrow("Informe um email valido");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should reject owner role", async () => {
    await expect(inviteUser("owner-1", "test@test.com", "owner")).rejects.toThrow("owner");
  });

  it("should reject duplicate invite for same email", async () => {
    mockListByOwner.mockResolvedValue([
      {
        id: "share-existing",
        owner_user_id: "owner-1",
        shared_with_email: "friend@test.com",
        role: "viewer",
        status: "accepted",
      },
    ]);

    await expect(inviteUser("owner-1", "friend@test.com", "editor")).rejects.toThrow(
      "ja compartilhado"
    );
  });
});

describe("revokeAccess", () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it("should set status to revoked", async () => {
    const existing: SharedAccess = {
      id: "share-1",
      owner_user_id: "owner-1",
      shared_with_user_id: "viewer-1",
      shared_with_email: "viewer@test.com",
      role: "viewer",
      status: "accepted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    mockUpdate.mockResolvedValue({ ...existing, status: "revoked" });

    const result = await revokeAccess(existing);
    expect(result.status).toBe("revoked");
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "revoked" }));
  });
});
