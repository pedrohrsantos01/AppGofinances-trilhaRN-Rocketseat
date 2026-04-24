import React, { useCallback, useRef } from "react";
import { ActivityIndicator, Alert, Animated, StatusBar, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import { useAuth } from "../../auth/presentation/AuthContext";

import { HighLightCard } from "../../../shared/presentation/components/HighLightCard";
import { TransactionCard } from "../../../shared/presentation/components/TransactionCard";

import { useTransactionStore } from "./useTransactionStore";

import {
  Container,
  UserWrapper,
  UserInfo,
  User,
  Photo,
  UserGreetings,
  UserName,
  NotificationButton,
  Icon,
  HighLightCards,
  Transactions,
  Title,
  ListTransactions,
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
  const { user } = useAuth();
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
    Alert.alert("Excluir transacao", "Tem certeza que deseja excluir esta transacao?", [
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
          <LinearGradient
            colors={[theme.colors.gradient_start, theme.colors.gradient_end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: "100%",
              height: RFPercentage(38),
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              paddingTop: (StatusBar.currentHeight ?? 44) + RFValue(12),
            }}
          >
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }} />
                <User>
                  <UserGreetings>Ola,</UserGreetings>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <NotificationButton onPress={() => navigation.navigate("InsightList")}>
                <Icon name="bell" />
              </NotificationButton>
            </UserWrapper>
          </LinearGradient>

          <HighLightCards>
            <HighLightCard
              type="up"
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
            />
            <HighLightCard
              type="down"
              title="Saidas"
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
            <Title>Transacoes recentes</Title>

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
