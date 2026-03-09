import { Category } from "../../domain/entities/Category";

export interface CategoryService {
  getAll(): Category[];
  getByKey(key: string): Category | undefined;
}
