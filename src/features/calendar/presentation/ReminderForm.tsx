import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import { createReminder } from "../application/createReminder";

import {
  Container,
  Header,
  BackButton,
  BackIcon,
  HeaderTitle,
  Form,
  Label,
  Input,
  SubmitButton,
  SubmitText,
} from "./ReminderFormStyles";

export function ReminderForm() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const navigation = useNavigation();
  const { user } = useAuth();

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert("Erro", "Informe o título");
      return;
    }
    if (!dueDate.trim()) {
      Alert.alert("Erro", "Informe a data de vencimento (dd/mm/aaaa)");
      return;
    }

    const parts = dueDate.split("/");
    let isoDate = dueDate;
    if (parts.length === 3) {
      isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const numericAmount = parseFloat(amount.replace(",", ".")) || 0;
    const amountCents = Math.round(numericAmount * 100);

    await createReminder({
      title: title.trim(),
      due_date: isoDate,
      amount_cents: amountCents,
      user_id: user.id,
    });

    navigation.goBack();
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon name="arrow-left" />
        </BackButton>
        <HeaderTitle>Novo Lembrete</HeaderTitle>
      </Header>

      <ScrollView>
        <Form>
          <Label>Título</Label>
          <Input placeholder="Ex: Aluguel, Internet..." value={title} onChangeText={setTitle} />

          <Label>Data de vencimento</Label>
          <Input
            placeholder="dd/mm/aaaa"
            keyboardType="numeric"
            value={dueDate}
            onChangeText={setDueDate}
          />

          <Label>Valor (R$)</Label>
          <Input
            placeholder="0,00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <SubmitButton onPress={handleSubmit}>
            <SubmitText>Salvar</SubmitText>
          </SubmitButton>
        </Form>
      </ScrollView>
    </Container>
  );
}
