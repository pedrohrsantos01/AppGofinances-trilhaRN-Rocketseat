import { getUpcomingDues } from "../../../../features/calendar/application/getUpcomingDues";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("getUpcomingDues", () => {
  it("should return empty array when no reminders exist", async () => {
    const upcoming = await getUpcomingDues("user-1", 30);
    expect(upcoming).toEqual([]);
  });
});
