import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { useTheme } from "styled-components/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import type { Account } from "../../../shared/domain/entities/Account";
import { formatCents } from "../../../shared/application/formatMoney";
import { AccountRepository } from "../infra/AccountRepository";

import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";
import {
  Container,
  AddButton,
  AddIcon,
  Content,
  AccountCard,
  ColorDot,
  AccountInfo,
  AccountName,
  AccountType,
  AccountBalance,
  EmptyContainer,
  EmptyText,
  EmptyIcon,
  LoadContainer,
} from "./AccountListStyles";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  cash: "Dinheiro",
  investment: "Investimento",
  other: "Outro",
};

const accountRepo = new AccountRepository();

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  async function loadAccounts() {
    setIsLoading(true);
    const data = await accountRepo.listByUser(user.id);
    setAccounts(data);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  function handleAddAccount() {
    navigation.navigate("AccountForm");
  }

  function renderAccount({ item }: { item: Account }) {
    const balance = formatCents(item.balance_cents);

    return (
      <AccountCard>
        <ColorDot color={item.color} />
        <AccountInfo>
          <AccountName>{item.name}</AccountName>
          <AccountType>{ACCOUNT_TYPE_LABELS[item.type] ?? item.type}</AccountType>
        </AccountInfo>
        <AccountBalance>{balance}</AccountBalance>
      </AccountCard>
    );
  }

  return (
    <Container>
      <ScreenHeader
        title="Contas"
        rightAction={
          <AddButton onPress={handleAddAccount}>
            <AddIcon name="plus" />
          </AddButton>
        }
      />

      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : accounts.length === 0 ? (
        <EmptyContainer>
          <EmptyIcon name="credit-card" />
          <EmptyText>Nenhuma conta cadastrada.{"\n"}Toque em + para adicionar.</EmptyText>
        </EmptyContainer>
      ) : (
        <Content>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            renderItem={renderAccount}
            showsVerticalScrollIndicator={false}
          />
        </Content>
      )}
    </Container>
  );
}
