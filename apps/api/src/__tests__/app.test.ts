import { buildApp } from "../app";
import { InMemorySharingService } from "../services/inMemorySharingService";

describe("api app", () => {
  it("returns a health envelope", async () => {
    const app = buildApp();

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { status: "ok" },
      error: null,
      meta: expect.objectContaining({ service: "gofinances-api" }),
    });
  });

  it("requires a bearer token for authenticated routes", async () => {
    const app = buildApp();

    const response = await app.inject({ method: "GET", url: "/v1/me" });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      data: null,
      error: { code: "AUTH_REQUIRED", message: "Missing bearer token" },
      meta: expect.any(Object),
    });
  });

  it("returns the authenticated user from the auth verifier", async () => {
    const app = buildApp({
      authVerifier: async () => ({ id: "user-1", email: "ana@example.com" }),
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/me",
      headers: { authorization: "Bearer valid-token" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual({ id: "user-1", email: "ana@example.com" });
  });

  it("accepts sync push batches and returns idempotent mutation results", async () => {
    const app = buildApp({
      authVerifier: async () => ({ id: "user-1", email: "ana@example.com" }),
      syncService: {
        push: async (_user, mutations) => ({
          accepted: mutations.map((mutation) => ({
            id: mutation.id,
            entity_id: mutation.entity_id,
            server_version: 1,
          })),
          conflicts: [],
        }),
        pull: async () => ({ changes: [], cursor: "cursor-1" }),
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/sync/push",
      headers: { authorization: "Bearer valid-token" },
      payload: {
        mutations: [
          {
            id: "m1",
            entity_type: "transactions",
            entity_id: "tx1",
            operation: "insert",
            payload: { id: "tx1" },
            idempotency_key: "device-1:m1",
            device_id: "device-1",
            created_at: "2026-04-24T12:00:00.000Z",
          },
        ],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.accepted).toEqual([
      { id: "m1", entity_id: "tx1", server_version: 1 },
    ]);
  });

  it("creates, lists, and revokes sharing invites through the BFF", async () => {
    const app = buildApp({
      authVerifier: async () => ({ id: "owner-1", email: "owner@example.com" }),
      sharingService: new InMemorySharingService(),
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/sharing/invites",
      headers: { authorization: "Bearer valid-token" },
      payload: { email: "viewer@example.com", role: "viewer" },
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json().data).toEqual(
      expect.objectContaining({
        owner_user_id: "owner-1",
        shared_with_email: "viewer@example.com",
        role: "viewer",
        status: "pending",
      })
    );

    const shareId = createResponse.json().data.id;
    const listResponse = await app.inject({
      method: "GET",
      url: "/v1/sharing/invites",
      headers: { authorization: "Bearer valid-token" },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().data).toHaveLength(1);

    const revokeResponse = await app.inject({
      method: "PATCH",
      url: `/v1/sharing/${shareId}/revoke`,
      headers: { authorization: "Bearer valid-token" },
    });

    expect(revokeResponse.statusCode).toBe(200);
    expect(revokeResponse.json().data).toEqual(
      expect.objectContaining({ id: shareId, status: "revoked" })
    );
  });
});
