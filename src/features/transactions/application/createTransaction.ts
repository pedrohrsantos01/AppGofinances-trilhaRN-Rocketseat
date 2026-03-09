import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

export interface CreateTransactionInput {
  name: string;
  amount: number;
  type: "positive" | "negative";
  categoryKey: string;
  userId: string;
}

export interface StoredTransaction {
  id: string;
  name: string;
  amount: string;
  type: "positive" | "negative";
  category: string;
  date: string;
}

function getStorageKey(userId: string): string {
  return `@gofinances:transactions_user${userId}`;
}

export async function createTransaction(input: CreateTransactionInput): Promise<StoredTransaction> {
  const { name, amount, type, categoryKey, userId } = input;

  const newTransaction: StoredTransaction = {
    id: String(uuid.v4()),
    name,
    amount: String(amount),
    type,
    category: categoryKey,
    date: new Date().toISOString(),
  };

  const dataKey = getStorageKey(userId);
  const data = await AsyncStorage.getItem(dataKey);
  const currentData: StoredTransaction[] = data ? JSON.parse(data) : [];
  const updatedData = [...currentData, newTransaction];

  await AsyncStorage.setItem(dataKey, JSON.stringify(updatedData));

  return newTransaction;
}
