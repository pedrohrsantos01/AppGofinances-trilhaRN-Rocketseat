import React, { useState } from "react";
import { Modal, Keyboard, Alert } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Container, Header, Title, Form, Fields, TransactionsTypes } from "./RegisterStyles";

import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";

import { InputForm } from "../../../shared/presentation/components/Form/InputForm";
import { Button } from "../../../shared/presentation/components/Form/Button";
import { TransactionTypeButton } from "../../../shared/presentation/components/Form/TransactionTypeButton";
import { CategorySelectButton } from "../../../shared/presentation/components/Form/CategorySelectButton";

import { CategorySelect } from "./CategorySelect";
import { useAuth } from "../../auth/presentation/AuthContext";

const schema = Yup.object().shape({
  name: Yup.string().required("Nome e obrigatorio"),
  amount: Yup.number()
    .typeError("Informe um valor numerico")
    .positive("O valor nao pode ser negativo")
    .required("O valor e obrigatorio"),
});

export function Register() {
  const [transactionType, setTransactionType] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const { user } = useAuth();

  const [category, setCategory] = useState({
    key: "category",
    name: "Categoria",
  });

  const navigation = useNavigation<any>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema) as any,
  });

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

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: String(form.amount),
      type: transactionType,
      category: category.key,
      date: new Date(),
    };

    try {
      const dataKey = `@gofinances:transactions_user${user.id}`;
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];
      const dataFormatted = [...currentData, newTransaction];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

      reset();
      setTransactionType("");
      setCategory({
        key: "category",
        name: "Categoria",
      });

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
        <Header>
          <Title>Cadastro</Title>
        </Header>
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
          </Fields>

          <Button onPress={handleSubmit(handleRegister)} title="Enviar" />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
