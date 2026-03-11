import React, { useState } from "react";
import { Alert, Keyboard } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

import { Input } from "../../../shared/presentation/components/Form/Input";
import { Button } from "../../../shared/presentation/components/Form/Button";
import { useAuth } from "../../auth/presentation/AuthContext";
import { createGoal } from "../application/createGoal";
import { Money } from "../../../shared/domain/value-objects/Money";

import { Container, Header, Title, Form, Fields } from "./GoalFormStyles";

const COLORS = ["#5636D3", "#FF872C", "#12A454", "#e83f5b", "#3B82F6", "#8B5CF6"];
const ICONS = ["flag", "home", "briefcase", "heart", "star", "gift"];

export function GoalForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  const { user } = useAuth();
  const navigation = useNavigation<any>();

  async function handleSubmit() {
    if (!name.trim()) {
      return Alert.alert("Informe o nome da meta");
    }

    const cents = Money.fromDecimal(parseFloat(amount.replace(",", "."))).toCents();
    if (isNaN(cents) || cents <= 0) {
      return Alert.alert("Informe um valor valido");
    }

    let parsedDate: string | undefined;
    if (targetDate) {
      const parts = targetDate.split("/");
      if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2) {
        return Alert.alert("Data invalida. Use dd/mm/aaaa");
      }
      parsedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    try {
      await createGoal({
        name,
        target_cents: cents,
        target_date: parsedDate,
        color: selectedColor,
        icon: selectedIcon,
        user_id: user.id,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(error.message ?? "Erro ao criar meta");
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Nova Meta</Title>
        </Header>

        <Form>
          <Fields>
            <Input placeholder="Nome da meta" value={name} onChangeText={setName} />
            <Input
              placeholder="Valor alvo (R$)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Input
              placeholder="Data alvo (dd/mm/aaaa) - opcional"
              keyboardType="numeric"
              value={targetDate}
              onChangeText={setTargetDate}
            />
          </Fields>
          <Button title="Criar meta" onPress={handleSubmit} />
        </Form>
      </Container>
    </TouchableWithoutFeedback>
  );
}
