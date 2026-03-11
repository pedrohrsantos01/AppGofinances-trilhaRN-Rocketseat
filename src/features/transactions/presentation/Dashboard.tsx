import React, { useCallback, useRef } from "react";
import { ActivityIndicator, Alert, Animated, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import { useAuth } from "../../auth/presentation/AuthContext";

import { HighLightCard } from "../../../shared/presentation/components/HighLightCard";
import { TransactionCard } from "../../../shared/presentation/components/TransactionCard";

import { useTransactionStore } from "./useTransactionStore";

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  User,
  Photo,
  UserGreetings,
  UserName,
  Icon,
  HighLightCards,
  Transactions,
  Title,
  ListTransactions,
  LogoutButton,
  LoadContainer,
  DeleteAction,
  DeleteActionIcon,
} from "./DashboardStyles";

export interface DataListProps {
  id: string;
  name: string;
  amount: string;
  type: "positive" | "negative";
  category: string;
  date: string;
}

export function Dashboard() {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const navigation = useNavigation<any>();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const {
    formattedTransactions,
    highlightData,
    isLoading,
    loadTransactions,
    deleteTransaction,
    getById,
  } = useTransactionStore();

  function handleDeleteTransaction(id: string) {
    Alert.alert("Excluir transação", "Tem certeza que deseja excluir esta transação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteTransaction(id, user.id),
      },
    ]);
  }

  function handleEditTransaction(id: string) {
    const tx = getById(id);
    if (tx) {
      navigation.navigate("EditTransaction", { transaction: tx });
    }
  }

  function renderRightActions(
    _progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) {
    return (
      <DeleteAction>
        <DeleteActionIcon name="trash-2" />
      </DeleteAction>
    );
  }

  useFocusEffect(
    useCallback(() => {
      loadTransactions(user.id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />

                <User>
                  <UserGreetings>Olá,</UserGreetings>
                  <UserName> {user.name} </UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={() => navigation.navigate("CashFlow")}>
                <Icon name="trending-up" />
              </LogoutButton>
              <LogoutButton onPress={() => navigation.navigate("InsightList")}>
                <Icon name="zap" />
              </LogoutButton>
              <LogoutButton onPress={() => navigation.navigate("GoalList")}>
                <Icon name="target" />
              </LogoutButton>
              <LogoutButton onPress={() => navigation.navigate("Sync")}>
                <Icon name="cloud" />
              </LogoutButton>
              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>
          <HighLightCards>
            <HighLightCard
              type="up"
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
            />
            <HighLightCard
              type="down"
              title="Saídas"
              amount={highlightData.expensives.amount}
              lastTransaction={highlightData.expensives.lastTransaction}
            />
            <HighLightCard
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
            />
          </HighLightCards>

          <Transactions>
            <Title>Listagem</Title>

            <ListTransactions
              data={formattedTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Swipeable
                  ref={(ref) => {
                    if (ref) swipeableRefs.current.set(item.id, ref);
                  }}
                  renderRightActions={renderRightActions}
                  onSwipeableOpen={() => {
                    swipeableRefs.current.get(item.id)?.close();
                    handleDeleteTransaction(item.id);
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleEditTransaction(item.id)}
                  >
                    <TransactionCard data={item} />
                  </TouchableOpacity>
                </Swipeable>
              )}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
