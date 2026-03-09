import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppError } from "../../domain/errors/AppError";

export class AsyncStorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      throw new AppError("STORAGE_ERROR", `Failed to read key "${key}"`, error);
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new AppError("STORAGE_ERROR", `Failed to write key "${key}"`, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new AppError("STORAGE_ERROR", `Failed to remove key "${key}"`, error);
    }
  }

  async getSchemaVersion(): Promise<number> {
    const version = await this.get<number>("@gofinances:schema_version");
    return version ?? 1;
  }

  async setSchemaVersion(version: number): Promise<void> {
    await this.set("@gofinances:schema_version", version);
  }
}
