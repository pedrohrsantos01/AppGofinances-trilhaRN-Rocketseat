import uuid from "react-native-uuid";
import { CreditCard } from "../../../shared/domain/entities/CreditCard";
import { AppError } from "../../../shared/domain/errors/AppError";
import { CreditCardRepository } from "../infra/CreditCardRepository";

export interface CreateCreditCardInput {
  name: string;
  limit_cents: number;
  closing_day: number;
  due_day: number;
  color?: string;
  account_id: string;
  userId: string;
}

const cardRepo = new CreditCardRepository();

export async function createCreditCard(input: CreateCreditCardInput): Promise<CreditCard> {
  if (!input.name.trim()) {
    throw new AppError("VALIDATION_ERROR", "Nome do cartão é obrigatório");
  }

  if (input.limit_cents <= 0) {
    throw new AppError("VALIDATION_ERROR", "Limite deve ser maior que zero");
  }

  if (input.closing_day < 1 || input.closing_day > 31) {
    throw new AppError("VALIDATION_ERROR", "Dia de fechamento inválido");
  }

  if (input.due_day < 1 || input.due_day > 31) {
    throw new AppError("VALIDATION_ERROR", "Dia de vencimento inválido");
  }

  const now = new Date().toISOString();

  const card: CreditCard = {
    id: String(uuid.v4()),
    name: input.name.trim(),
    limit_cents: input.limit_cents,
    closing_day: input.closing_day,
    due_day: input.due_day,
    currency: "BRL",
    color: input.color ?? "#FF872C",
    is_active: true,
    account_id: input.account_id,
    created_at: now,
    updated_at: now,
    version: 1,
    user_id: input.userId,
  };

  return cardRepo.create(card);
}
