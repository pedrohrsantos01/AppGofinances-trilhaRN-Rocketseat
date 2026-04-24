import { getDefaultAccountId } from "../../../../shared/infra/database/seedDefaultAccount";

describe("default account id", () => {
  it("is scoped by user to avoid collisions on shared devices", () => {
    expect(getDefaultAccountId("user-1")).toBe("default-account-user-1");
    expect(getDefaultAccountId("user-2")).toBe("default-account-user-2");
  });

  it("normalizes unsafe characters", () => {
    expect(getDefaultAccountId("google:user@example.com")).toBe(
      "default-account-google-user-example-com"
    );
  });
});
