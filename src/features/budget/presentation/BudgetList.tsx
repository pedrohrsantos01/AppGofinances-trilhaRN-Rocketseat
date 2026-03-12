import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { useTheme } from "styled-components/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAuth } from "../../auth/presentation/AuthContext";
import { Money } from "../../../shared/domain/value-objects/Money";
import { categories } from "../../../shared/utils/categories";
import { listBudgets, BudgetWithStatus } from "../application/listBudgets";

import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";

import {
  Container,
  AddButton,
  AddIcon,
  MonthSelector,
  MonthButton,
  MonthIcon,
  MonthText,
  Content,
  BudgetCard,
  BudgetHeader,
  CategoryDot,
  CategoryName,
  BudgetAmount,
  ProgressBarContainer,
  ProgressFill,
  BudgetFooter,
  SpentText,
  RemainingText,
  EmptyContainer,
  EmptyText,
  EmptyIcon,
  LoadContainer,
} from "./BudgetListStyles";

function getAlertColor(alert: string | null): string {
  switch (alert) {
    case "critical":
      return "#E83F5B";
    case "warning":
      return "#FF872C";
    default:
      return "#12A454";
  }
}

export function BudgetList() {
  const [budgets, setBudgets] = useState<BudgetWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  async function loadBudgets() {
    setIsLoading(true);
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    const data = await listBudgets(user.id, month, year);
    setBudgets(data);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate])
  );

  function handlePreviousMonth() {
    setSelectedDate((prev) => subMonths(prev, 1));
  }

  function handleNextMonth() {
    setSelectedDate((prev) => addMonths(prev, 1));
  }

  function handleAddBudget() {
    navigation.navigate("BudgetForm", {
      month: selectedDate.getMonth() + 1,
      year: selectedDate.getFullYear(),
    });
  }

  function renderBudget({ item }: { item: BudgetWithStatus }) {
    const category = categories.find((c) => c.key === item.category_id);
    const limit = Money.fromCents(item.limit_cents).toFormatted();
    const spent = Money.fromCents(item.consumption.spent_cents).toFormatted();
    const remaining = Money.fromCents(Math.max(0, item.consumption.remaining_cents)).toFormatted();
    const alertColor = getAlertColor(item.alert);

    return (
      <BudgetCard>
        <BudgetHeader>
          <CategoryDot color={category?.color ?? "#999"} />
          <CategoryName>{category?.name ?? item.category_id}</CategoryName>
          <BudgetAmount>{limit}</BudgetAmount>
        </BudgetHeader>
        <ProgressBarContainer>
          <ProgressFill percent={item.consumption.percent} alertColor={alertColor} />
        </ProgressBarContainer>
        <BudgetFooter>
          <SpentText>Gasto: {spent}</SpentText>
          <RemainingText>Restante: {remaining}</RemainingText>
        </BudgetFooter>
      </BudgetCard>
    );
  }

  return (
    <Container>
      <ScreenHeader
        title="Orçamentos"
        rightAction={
          <AddButton onPress={handleAddBudget}>
            <AddIcon name="plus" />
          </AddButton>
        }
      />

      <MonthSelector>
        <MonthButton onPress={handlePreviousMonth}>
          <MonthIcon name="chevron-left" />
        </MonthButton>
        <MonthText>{format(selectedDate, "MMMM yyyy", { locale: ptBR })}</MonthText>
        <MonthButton onPress={handleNextMonth}>
          <MonthIcon name="chevron-right" />
        </MonthButton>
      </MonthSelector>

      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : budgets.length === 0 ? (
        <EmptyContainer>
          <EmptyIcon name="target" />
          <EmptyText>Nenhum orçamento definido.{"\n"}Toque em + para adicionar.</EmptyText>
        </EmptyContainer>
      ) : (
        <Content>
          <FlatList
            data={budgets}
            keyExtractor={(item) => item.id}
            renderItem={renderBudget}
            showsVerticalScrollIndicator={false}
          />
        </Content>
      )}
    </Container>
  );
}
