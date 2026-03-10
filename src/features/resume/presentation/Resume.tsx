import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { VictoryPie } from "victory-native";
import { RFValue } from "react-native-responsive-fontsize";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "styled-components/native";

import { HistoryCard } from "../../../shared/presentation/components/HistoryCard";

import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from "./ResumeStyles";
import { categories } from "../../../shared/utils/categories";
import { useAuth } from "../../auth/presentation/AuthContext";
import { TransactionRepository } from "../../transactions/infra/TransactionRepository";
import { Money } from "../../../shared/domain/value-objects/Money";

interface CategoryData {
  key: string;
  name: string;
  totalFormatted: string;
  total: number;
  color: string;
  percent: string;
}

const transactionRepo = new TransactionRepository();

export function Resume() {
  const [isLoading, setIsLoanding] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

  const { user } = useAuth();
  const theme = useTheme();

  function handleDateChange(action: "next" | "prev") {
    if (action === "next") {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function LoadData() {
    setIsLoanding(true);

    const txs = await transactionRepo.listByUser(user.id, {
      month: selectedDate.getMonth(),
      year: selectedDate.getFullYear(),
    });

    const expenses = txs.filter((tx) => tx.type === "expense");

    const expensesTotalCents = expenses.reduce((acc, tx) => acc + tx.amount_cents, 0);

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let categorySumCents = 0;

      expenses.forEach((tx) => {
        if (tx.category_id === category.key) {
          categorySumCents += tx.amount_cents;
        }
      });

      if (categorySumCents > 0) {
        const totalFormatted = Money.fromCents(categorySumCents).toFormatted();
        const percent = `${((categorySumCents / expensesTotalCents) * 100).toFixed(0)}%`;

        totalByCategory.push({
          name: category.name,
          color: category.color,
          key: category.key,
          total: categorySumCents,
          totalFormatted,
          percent,
        });
      }
    });

    setTotalByCategories(totalByCategory);
    setIsLoanding(false);
  }

  useFocusEffect(
    useCallback(() => {
      LoadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate])
  );

  return (
    <Container>
      <Header>
        <Title> Resumo por categoria </Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <Content>
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange("prev")}>
              <MonthSelectIcon name="chevron-left" />
            </MonthSelectButton>

            <Month>
              {format(selectedDate, "MMMM, yyyy", {
                locale: ptBR,
              })}
            </Month>

            <MonthSelectButton onPress={() => handleDateChange("next")}>
              <MonthSelectIcon name="chevron-right" />
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              x="percent"
              y="total"
              colorScale={totalByCategories.map((category) => category.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: "bold",
                  fill: theme.colors.shape,
                },
              }}
              labelRadius={50}
            />
          </ChartContainer>
          {totalByCategories.map((item) => (
            <HistoryCard
              key={item.key}
              title={item.name}
              color={item.color}
              amount={item.totalFormatted}
            />
          ))}
        </Content>
      )}
    </Container>
  );
}
