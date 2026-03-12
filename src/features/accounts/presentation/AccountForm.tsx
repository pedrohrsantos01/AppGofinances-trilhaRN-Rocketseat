import React, { useState } from "react";
import { Alert, Keyboard } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import { Input } from "../../../shared/presentation/components/Form/Input";
import { Button } from "../../../shared/presentation/components/Form/Button";
import { AccountType } from "../../../shared/domain/entities/Account";
import { createAccount } from "../application/createAccount";

import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";
import {
  Container,
  Form,
  Fields,
  TypeSelector,
  TypeOption,
  TypeOptionText,
  Label,
} from "./AccountFormStyles";

const ACCOUNT_TYPES: { key: AccountType; label: string }[] = [
  { key: "cash", label: "Dinheiro" },
  { key: "checking", label: "Corrente" },
  { key: "savings", label: "Poupança" },
  { key: "investment", label: "Investimento" },
  { key: "other", label: "Outro" },
];

export function AccountForm() {
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("cash");
  const { user } = useAuth();
  const navigation = useNavigation();

  async function handleCreate() {
    if (!name.trim()) {
      return Alert.alert("Informe o nome da conta");
    }

    try {
      await createAccount({
        name,
        type: accountType,
        userId: user.id,
      });

      navigation.goBack();
    } catch {
      Alert.alert("Erro ao criar conta");
    }
  }

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      containerStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <Container>
        <ScreenHeader title="Nova Conta" showBack />

        <Form>
          <Fields>
            <Label>Nome</Label>
            <Input
              placeholder="Nome da conta"
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
              autoCorrect={false}
            />

            <Label>Tipo</Label>
            <TypeSelector>
              {ACCOUNT_TYPES.map((type) => (
                <TypeOption
                  key={type.key}
                  isActive={accountType === type.key}
                  onPress={() => setAccountType(type.key)}
                >
                  <TypeOptionText isActive={accountType === type.key}>{type.label}</TypeOptionText>
                </TypeOption>
              ))}
            </TypeSelector>
          </Fields>

          <Button title="Criar conta" onPress={handleCreate} />
        </Form>
      </Container>
    </TouchableWithoutFeedback>
  );
}
