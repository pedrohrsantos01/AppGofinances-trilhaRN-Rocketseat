import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import { useAuth } from "../../auth/presentation/AuthContext";

import { HighLightCard } from "../../../shared/presentation/components/HighLightCard";
import {
  TransactionCard,
  TransactionCardProps,
} from "../../../shared/presentation/components/TransactionCard";

import { TransactionRepository } from "../infra/TransactionRepository";
import { Transaction } from "../../../shared/domain/entities/Transaction";
import { Money } from "../../../shared/domain/value-objects/Money";

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

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighLightProps {
  amount: string;
  lastTransaction: string;
}
interface HighLightData {
  entries: HighLightProps;
  expensives: HighLightProps;
  total: HighLightProps;
}

const transactionRepo = new TransactionRepository();

function formatCurrency(cents: number): string {
  return Money.fromCents(cents).toFormatted();
}

function getLastTransactionDate(txs: Transaction[], type: "income" | "expense"): string | 0 {
  const filtered = txs.filter((tx) => tx.type === type);
  if (filtered.length === 0) return 0;

  const lastDate = new Date(Math.max(...filtered.map((tx) => new Date(tx.date).getTime())));
  return `${lastDate.getDate()} de ${lastDate.toLocaleString("pt-BR", {
    month: "long",
  })}`;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighLightData>({} as HighLightData);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);

  const theme = useTheme();
  const { signOut, user } = useAuth();
  const navigation = useNavigation<any>();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  async function loadTransactions() {
    setIsLoading(true);
    const txs = await transactionRepo.listByUser(user.id);

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = txs.map((tx) => {
      if (tx.type === "income") {
        entriesTotal += tx.amount_cents;
      } else if (tx.type === "expense") {
        expensiveTotal += tx.amount_cents;
      }

      const amount = Money.fromCents(tx.amount_cents).toFormatted();
      const date = Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).format(new Date(tx.date));

      return {
        id: tx.id,
        name: tx.name,
        amount,
        type: tx.type === "income" ? "positive" : "negative",
        category: tx.category_id,
        date,
      };
    });

    setTransactions(transactionsFormatted);
    setRawTransactions(txs);

    const lastEntries = getLastTransactionDate(txs, "income");
    const lastExpensives = getLastTransactionDate(txs, "expense");
    const totalInterval = lastExpensives === 0 ? "Não há transações" : `01 à ${lastExpensives}`;

    const total = entriesTotal - expensiveTotal;
    setHighlightData({
      entries: {
        amount: formatCurrency(entriesTotal),
        lastTransaction: lastEntries === 0 ? "Não há transações" : `Última entrada ${lastEntries}`,
      },
      expensives: {
        amount: formatCurrency(expensiveTotal),
        lastTransaction:
          lastExpensives === 0 ? "Não há transações" : `Última saída ${lastExpensives}`,
      },
      total: {
        amount: formatCurrency(total),
        lastTransaction: totalInterval,
      },
    });

    setIsLoading(false);
  }

  async function handleDeleteTransaction(id: string) {
    Alert.alert("Excluir transação", "Tem certeza que deseja excluir esta transação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await transactionRepo.delete(id);
          loadTransactions();
        },
      },
    ]);
  }

  function handleEditTransaction(id: string) {
    const tx = rawTransactions.find((t) => t.id === id);
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
      loadTransactions();
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
              data={transactions}
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
