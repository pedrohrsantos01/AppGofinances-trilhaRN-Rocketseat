import { SharedAccessRepository } from "../../../../features/sharing/infra/SharedAccessRepository";
import { SharedAccess } from "../../../../shared/domain/entities/SharedAccess";

describe("SharedAccessRepository BFF gateway", () => {
  const request = jest.fn();

  beforeEach(() => {
    request.mockReset();
  });

  it("creates invites through the BFF instead of Supabase direct writes", async () => {
    const share: SharedAccess = {
      id: "share-1",
      owner_user_id: "owner-1",
      shared_with_user_id: "",
      shared_with_email: "viewer@example.com",
      role: "viewer",
      status: "pending",
      created_at: "2026-04-24T12:00:00.000Z",
      updated_at: "2026-04-24T12:00:00.000Z",
      version: 1,
    };
    request.mockResolvedValue(share);

    const repository = new SharedAccessRepository({ request });
    const result = await repository.create(share);

    expect(result).toEqual(share);
    expect(request).toHaveBeenCalledWith("/v1/sharing/invites", {
      method: "POST",
      body: { email: "viewer@example.com", role: "viewer" },
    });
  });

  it("lists owner invites through the BFF", async () => {
    request.mockResolvedValue([]);

    const repository = new SharedAccessRepository({ request });
    const result = await repository.listByOwner("owner-1");

    expect(result).toEqual([]);
    expect(request).toHaveBeenCalledWith("/v1/sharing/invites");
  });

  it("revokes invites through the BFF", async () => {
    const share: SharedAccess = {
      id: "share-1",
      owner_user_id: "owner-1",
      shared_with_user_id: "",
      shared_with_email: "viewer@example.com",
      role: "viewer",
      status: "revoked",
      created_at: "2026-04-24T12:00:00.000Z",
      updated_at: "2026-04-24T12:00:00.000Z",
      version: 2,
    };
    request.mockResolvedValue(share);

    const repository = new SharedAccessRepository({ request });
    const result = await repository.update(share);

    expect(result).toEqual(share);
    expect(request).toHaveBeenCalledWith("/v1/sharing/share-1/revoke", { method: "PATCH" });
  });
});
