const mockCreateClient = jest.fn((_url?: string, _key?: string, _options?: unknown) => ({
  from: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: mockCreateClient,
}));

describe("createUserDatabaseClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    mockCreateClient.mockClear();
    process.env = {
      ...originalEnv,
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("creates a Supabase client with the authenticated user bearer token", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createUserDatabaseClient } = require("../supabase/database");

    createUserDatabaseClient({ id: "user-1", accessToken: "access-token-1" });

    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "anon-key",
      expect.objectContaining({
        global: {
          headers: {
            Authorization: "Bearer access-token-1",
          },
        },
      })
    );
  });
});
