import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { VictoryPie } from "victory-native";
import { RFValue } from "react-native-responsive-fontsize";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "styled-components/native";

import { HistoryCard } from "../../../shared/presentation/components/HistoryCard";
import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";

import {
  Container,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from "./ResumeStyles";
import { useAuth } from "../../auth/presentation/AuthContext";
import { useResumeStore } from "./useResumeStore";

export function Resume() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { user } = useAuth();
  const theme = useTheme();
  const { totalByCategories, isLoading, loadData } = useResumeStore();

  function handleDateChange(action: "next" | "prev") {
    if (action === "next") {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData(user.id, selectedDate.getMonth(), selectedDate.getFullYear());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate])
  );

  return (
    <Container>
      <ScreenHeader title="Resumo por categoria" />
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
