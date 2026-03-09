import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  aggregateByCategory,
  CategoryAggregate,
  RawTransaction,
} from "../domain/aggregateByCategory";

export async function getCategoryBreakdown(
  userId: string,
  month: number,
  year: number
): Promise<CategoryAggregate[]> {
  const dataKey = `@gofinances:transactions_user${userId}`;
  const response = await AsyncStorage.getItem(dataKey);
  const transactions: RawTransaction[] = response ? JSON.parse(response) : [];

  return aggregateByCategory(transactions, month, year);
}
