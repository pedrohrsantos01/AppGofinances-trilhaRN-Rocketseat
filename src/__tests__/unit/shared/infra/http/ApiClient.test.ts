import { ApiClient, ApiError } from "../../../../../shared/infra/http/ApiClient";

describe("ApiClient", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends bearer token and unwraps the data envelope", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "user-1" }, error: null, meta: {} }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new ApiClient({
      baseUrl: "https://api.example.com",
      getAccessToken: async () => "token-123",
    });

    const data = await client.request<{ id: string }>("/v1/me");

    expect(data).toEqual({ id: "user-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/me",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      })
    );
  });

  it("throws typed ApiError when the API returns an error envelope", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        data: null,
        error: { code: "FORBIDDEN", message: "Access denied" },
        meta: {},
      }),
    }) as unknown as typeof fetch;

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    await expect(client.request("/v1/me")).rejects.toMatchObject({
      name: "ApiError",
      code: "FORBIDDEN",
      status: 403,
      message: "Access denied",
    } satisfies Partial<ApiError>);
  });
});
