import React, { useState } from "react";
import { Alert, ScrollView, Switch } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import { categories } from "../../../shared/utils/categories";
import { createBudget } from "../application/createBudget";
import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";

import {
  Container,
  Form,
  Label,
  AmountInput,
  CategoryList,
  CategoryItem,
  CategoryDot,
  CategoryName,
  RolloverContainer,
  RolloverLabel,
  SubmitButton,
  SubmitText,
} from "./BudgetFormStyles";

interface RouteParams {
  month: number;
  year: number;
}

export function BudgetForm() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [rollover, setRollover] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { month, year } = route.params as RouteParams;

  async function handleSubmit() {
    if (!selectedCategory) {
      Alert.alert("Erro", "Selecione uma categoria");
      return;
    }

    const numericAmount = parseFloat(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Erro", "Informe um valor válido");
      return;
    }

    const limitCents = Math.round(numericAmount * 100);

    await createBudget({
      category_id: selectedCategory,
      limit_cents: limitCents,
      month,
      year,
      rollover,
      user_id: user.id,
    });

    navigation.goBack();
  }

  const expenseCategories = categories.filter((c) => c.key !== "salary");

  return (
    <Container>
      <ScreenHeader title="Novo Orçamento" showBack />

      <ScrollView>
        <Form>
          <Label>Limite mensal (R$)</Label>
          <AmountInput
            placeholder="0,00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Label>Categoria</Label>
          <CategoryList>
            {expenseCategories.map((cat) => (
              <CategoryItem
                key={cat.key}
                isSelected={selectedCategory === cat.key}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <CategoryDot color={cat.color} />
                <CategoryName>{cat.name}</CategoryName>
              </CategoryItem>
            ))}
          </CategoryList>

          <RolloverContainer>
            <RolloverLabel>Acumular saldo restante</RolloverLabel>
            <Switch value={rollover} onValueChange={setRollover} />
          </RolloverContainer>

          <SubmitButton onPress={handleSubmit}>
            <SubmitText>Salvar</SubmitText>
          </SubmitButton>
        </Form>
      </ScrollView>
    </Container>
  );
}
