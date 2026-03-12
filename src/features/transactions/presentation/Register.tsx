import React, { useEffect, useState } from "react";
import { Modal, Keyboard, Alert } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import uuid from "react-native-uuid";
import { format } from "date-fns";

import { Container, Form, Fields, TransactionsTypes } from "./RegisterStyles";
import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";

import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm } from "react-hook-form";

import { InputForm } from "../../../shared/presentation/components/Form/InputForm";
import { Input } from "../../../shared/presentation/components/Form/Input";
import { Button } from "../../../shared/presentation/components/Form/Button";
import { TransactionTypeButton } from "../../../shared/presentation/components/Form/TransactionTypeButton";
import { CategorySelectButton } from "../../../shared/presentation/components/Form/CategorySelectButton";

import { CategorySelect } from "./CategorySelect";
import { AccountSelect } from "./AccountSelect";
import { useAuth } from "../../auth/presentation/AuthContext";
import { TransactionRepository } from "../infra/TransactionRepository";
import { Transaction } from "../../../shared/domain/entities/Transaction";
import { generateInstallments } from "../domain/installments";
import { generateRecurringTransactions } from "../domain/recurring";
import { Money } from "../../../shared/domain/value-objects/Money";

import {
  ModeSelector,
  ModeButton,
  ModeButtonText,
  ExtraFields,
  ExtraLabel,
  FrequencySelector,
  FrequencyButton,
  FrequencyButtonText,
} from "./RegisterAdvancedStyles";

const transactionRepo = new TransactionRepository();

type TransactionMode = "simple" | "installment" | "recurring";

const schema = Yup.object().shape({
  name: Yup.string().required("Nome e obrigatorio"),
  amount: Yup.number()
    .typeError("Informe um valor numerico")
    .positive("O valor nao pode ser negativo")
    .required("O valor e obrigatorio"),
});

interface RouteParams {
  transaction?: Transaction;
}

export function Register() {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const editingTx = params?.transaction;
  const isEditing = !!editingTx;

  const [transactionType, setTransactionType] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [mode, setMode] = useState<TransactionMode>("simple");
  const [installmentCount, setInstallmentCount] = useState("2");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [endDate, setEndDate] = useState("");
  const { user } = useAuth();

  const [category, setCategory] = useState({
    key: "category",
    name: "Categoria",
  });

  const [account, setAccount] = useState({
    id: "default-account",
    name: "Carteira",
  });

  const navigation = useNavigation<any>();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    if (editingTx) {
      setValue("name", editingTx.name);
      setValue("amount", String(Money.fromCents(editingTx.amount_cents).toDecimal()));
      setTransactionType(editingTx.type === "income" ? "positive" : "negative");
      setCategory({
        key: editingTx.category_id,
        name: editingTx.category_id,
      });
      setAccount({
        id: editingTx.account_id,
        name: editingTx.account_id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTx]);

  function handleTransactionsTypeSelect(type: "positive" | "negative") {
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  }

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  }

  async function handleRegister(form: any) {
    if (!transactionType) {
      return Alert.alert("Selecione o tipo da transacao");
    }

    if (category.key === "category") {
      return Alert.alert("Selecione a categoria");
    }

    const now = new Date();
    const amountCents = Math.round(parseFloat(form.amount) * 100);
    const txType = transactionType === "positive" ? "income" : "expense";

    try {
      if (isEditing && editingTx) {
        const updatedTx: Transaction = {
          ...editingTx,
          name: form.name,
          amount_cents: amountCents,
          type: txType,
          category_id: category.key,
          updated_at: now.toISOString(),
        };
        await transactionRepo.update(updatedTx);
        navigation.goBack();
        return;
      }

      if (mode === "installment") {
        const count = parseInt(installmentCount, 10);
        if (isNaN(count) || count < 2) {
          return Alert.alert("Informe pelo menos 2 parcelas");
        }
        const txs = generateInstallments({
          name: form.name,
          total_amount_cents: amountCents,
          installment_count: count,
          category_id: category.key,
          account_id: account.id,
          start_date: format(now, "yyyy-MM-dd"),
          user_id: user.id,
        });
        await transactionRepo.createMany(txs);
      } else if (mode === "recurring") {
        if (!endDate) {
          return Alert.alert("Informe a data final (dd/mm/aaaa)");
        }
        const parts = endDate.split("/");
        if (parts.length !== 3) {
          return Alert.alert("Data final invalida. Use dd/mm/aaaa");
        }
        const endDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
        const txs = generateRecurringTransactions({
          name: form.name,
          amount_cents: amountCents,
          type: txType as "income" | "expense",
          category_id: category.key,
          account_id: account.id,
          frequency,
          start_date: format(now, "yyyy-MM-dd"),
          end_date: endDateISO,
          user_id: user.id,
        });
        await transactionRepo.createMany(txs);
      } else {
        const newTransaction: Transaction = {
          id: String(uuid.v4()),
          name: form.name,
          amount_cents: amountCents,
          currency: "BRL",
          type: txType,
          status: "confirmed",
          source: "manual",
          category_id: category.key,
          account_id: account.id,
          date: format(now, "yyyy-MM-dd"),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          version: 1,
          user_id: user.id,
        };
        await transactionRepo.create(newTransaction);
      }

      reset();
      setTransactionType("");
      setCategory({ key: "category", name: "Categoria" });
      setAccount({ id: "default-account", name: "Carteira" });
      setMode("simple");
      setInstallmentCount("2");
      setEndDate("");

      navigation.navigate("Listagem");
    } catch (error) {
      console.log(error);
      Alert.alert("Nao foi possivel salvar");
    }
  }

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      containerStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <Container>
        <ScreenHeader title={isEditing ? "Editar" : "Cadastro"} showBack={isEditing} />
        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name?.message?.toString()}
            />

            <InputForm
              name="amount"
              control={control}
              placeholder="Preco"
              keyboardType="numeric"
              error={errors.amount?.message?.toString()}
            />

            <TransactionsTypes>
              <TransactionTypeButton
                type="up"
                title="Entrada"
                onPress={() => handleTransactionsTypeSelect("positive")}
                isActive={transactionType === "positive"}
              />
              <TransactionTypeButton
                type="down"
                title="Saida"
                onPress={() => handleTransactionsTypeSelect("negative")}
                isActive={transactionType === "negative"}
              />
            </TransactionsTypes>

            <CategorySelectButton title={category.name} onPress={handleOpenSelectCategoryModal} />
            <CategorySelectButton title={account.name} onPress={() => setAccountModalOpen(true)} />

            {!isEditing && (
              <>
                <ModeSelector>
                  <ModeButton isActive={mode === "simple"} onPress={() => setMode("simple")}>
                    <ModeButtonText isActive={mode === "simple"}>Simples</ModeButtonText>
                  </ModeButton>
                  <ModeButton
                    isActive={mode === "installment"}
                    onPress={() => setMode("installment")}
                  >
                    <ModeButtonText isActive={mode === "installment"}>Parcelado</ModeButtonText>
                  </ModeButton>
                  <ModeButton isActive={mode === "recurring"} onPress={() => setMode("recurring")}>
                    <ModeButtonText isActive={mode === "recurring"}>Recorrente</ModeButtonText>
                  </ModeButton>
                </ModeSelector>

                {mode === "installment" && (
                  <ExtraFields>
                    <ExtraLabel>Numero de parcelas</ExtraLabel>
                    <Input
                      placeholder="Ex: 12"
                      keyboardType="numeric"
                      value={installmentCount}
                      onChangeText={setInstallmentCount}
                    />
                  </ExtraFields>
                )}

                {mode === "recurring" && (
                  <ExtraFields>
                    <ExtraLabel>Frequencia</ExtraLabel>
                    <FrequencySelector>
                      {(["daily", "weekly", "monthly", "yearly"] as const).map((f) => (
                        <FrequencyButton
                          key={f}
                          isActive={frequency === f}
                          onPress={() => setFrequency(f)}
                        >
                          <FrequencyButtonText isActive={frequency === f}>
                            {f === "daily"
                              ? "Diario"
                              : f === "weekly"
                                ? "Semanal"
                                : f === "monthly"
                                  ? "Mensal"
                                  : "Anual"}
                          </FrequencyButtonText>
                        </FrequencyButton>
                      ))}
                    </FrequencySelector>
                    <ExtraLabel>Data final (dd/mm/aaaa)</ExtraLabel>
                    <Input
                      placeholder="31/12/2026"
                      keyboardType="numeric"
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </ExtraFields>
                )}
              </>
            )}
          </Fields>

          <Button onPress={handleSubmit(handleRegister)} title={isEditing ? "Salvar" : "Enviar"} />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>

        <Modal visible={accountModalOpen}>
          <AccountSelect
            account={account}
            setAccount={setAccount}
            closeSelectAccount={() => setAccountModalOpen(false)}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
