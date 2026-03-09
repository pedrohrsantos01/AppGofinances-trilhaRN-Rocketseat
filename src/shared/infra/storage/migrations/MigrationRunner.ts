import AsyncStorage from "@react-native-async-storage/async-storage";
import { migrateAllTransactionsV1ToV2, V1Transaction } from "./v1_to_v2";

const SCHEMA_VERSION_KEY = "@gofinances:schema_version";
const CURRENT_SCHEMA_VERSION = 2;

export interface MigrationResult {
  from: number;
  to: number;
  migratedKeys: string[];
}

async function getSchemaVersion(): Promise<number> {
  const version = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);
  return version ? parseInt(version, 10) : 1;
}

async function setSchemaVersion(version: number): Promise<void> {
  await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(version));
}

async function runV1ToV2(): Promise<string[]> {
  const allKeys = await AsyncStorage.getAllKeys();
  const transactionKeys = allKeys.filter((key) => key.startsWith("@gofinances:transactions_user"));

  const migratedKeys: string[] = [];
  const defaultAccountId = "default-account";

  for (const key of transactionKeys) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;

    const transactions: V1Transaction[] = JSON.parse(raw);

    if (transactions.length === 0) continue;

    // Extract userId from key pattern: @gofinances:transactions_user<userId>
    const userId = key.replace("@gofinances:transactions_user", "");

    const migrated = migrateAllTransactionsV1ToV2(transactions, userId, defaultAccountId);
    await AsyncStorage.setItem(key, JSON.stringify(migrated));
    migratedKeys.push(key);
  }

  return migratedKeys;
}

export async function runMigrations(): Promise<MigrationResult> {
  const currentVersion = await getSchemaVersion();

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return { from: currentVersion, to: currentVersion, migratedKeys: [] };
  }

  const migratedKeys: string[] = [];

  if (currentVersion < 2) {
    const keys = await runV1ToV2();
    migratedKeys.push(...keys);
  }

  await setSchemaVersion(CURRENT_SCHEMA_VERSION);

  return {
    from: currentVersion,
    to: CURRENT_SCHEMA_VERSION,
    migratedKeys,
  };
}
