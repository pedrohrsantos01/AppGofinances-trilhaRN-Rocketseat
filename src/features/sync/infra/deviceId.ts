import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

export const DEVICE_ID_KEY = "@gofinances:device_id";

let cachedDeviceId: string | null = null;

export async function loadDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  const generated = String(uuid.v4());
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  cachedDeviceId = generated;
  return generated;
}

export function getDeviceId(): string {
  return cachedDeviceId ?? "local-device";
}

export function resetDeviceIdCache(): void {
  cachedDeviceId = null;
}
