import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadDeviceId,
  getDeviceId,
  resetDeviceIdCache,
  DEVICE_ID_KEY,
} from "../../../../features/sync/infra/deviceId";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("deviceId", () => {
  beforeEach(async () => {
    resetDeviceIdCache();
    await AsyncStorage.clear();
  });

  it("generates and persists a UUID when none is stored", async () => {
    const id = await loadDeviceId();

    expect(id).not.toBe("local-device");
    expect(id).toMatch(UUID_REGEX);
    expect(await AsyncStorage.getItem(DEVICE_ID_KEY)).toBe(id);
  });

  it("returns the previously persisted id across app loads", async () => {
    await AsyncStorage.setItem(DEVICE_ID_KEY, "existing-device-uuid");

    const id = await loadDeviceId();

    expect(id).toBe("existing-device-uuid");
  });

  it("returns the same id on repeated loads without regenerating", async () => {
    const first = await loadDeviceId();
    const second = await loadDeviceId();

    expect(second).toBe(first);
  });

  it("exposes the loaded id synchronously via getDeviceId", async () => {
    const loaded = await loadDeviceId();

    expect(getDeviceId()).toBe(loaded);
  });
});
