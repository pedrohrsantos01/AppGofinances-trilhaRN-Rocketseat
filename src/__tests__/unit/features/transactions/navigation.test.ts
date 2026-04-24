import { getPostTransactionRoute } from "../../../../features/transactions/application/navigation";

describe("transaction navigation", () => {
  it("returns an existing route after saving a transaction", () => {
    expect(getPostTransactionRoute()).toBe("Tabs");
  });
});
