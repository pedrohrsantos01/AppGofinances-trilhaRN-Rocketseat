import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "styled-components/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import { formatCents } from "../../../shared/application/formatMoney";
import {
  getCashFlowProjection,
  type CashFlowResult,
  type ProjectionPeriod,
} from "../application/getCashFlowProjection";
import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";

import {
  Container,
  Content,
  CurrentBalanceCard,
  CurrentBalanceLabel,
  CurrentBalanceAmount,
  PeriodCard,
  PeriodHeader,
  PeriodLabel,
  PeriodBalance,
  FlowRow,
  FlowLabel,
  FlowValue,
  Divider,
  ItemRow,
  ItemName,
  ItemAmount,
  EmptyText,
} from "./CashFlowStyles";

export function CashFlowScreen() {
  const theme = useTheme();
  const { user } = useAuth();

  const [data, setData] = useState<CashFlowResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setIsLoading(true);
        const result = await getCashFlowProjection(user.id);
        setData(result);
        setIsLoading(false);
      }
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  function renderPeriod(period: ProjectionPeriod) {
    const isNegative = period.projected_balance_cents < 0;
    return (
      <PeriodCard key={period.label}>
        <PeriodHeader>
          <PeriodLabel>{period.label}</PeriodLabel>
          <PeriodBalance negative={isNegative}>
            {formatCents(period.projected_balance_cents)}
          </PeriodBalance>
        </PeriodHeader>

        <FlowRow>
          <FlowLabel>Entradas previstas</FlowLabel>
          <FlowValue>+{formatCents(period.income_cents)}</FlowValue>
        </FlowRow>
        <FlowRow>
          <FlowLabel>Saidas previstas</FlowLabel>
          <FlowValue negative>-{formatCents(period.expense_cents)}</FlowValue>
        </FlowRow>

        {period.items.length > 0 && (
          <>
            <Divider />
            {period.items.slice(0, 5).map((item, idx) => (
              <ItemRow key={`${item.name}-${idx}`}>
                <ItemName>{item.name}</ItemName>
                <ItemAmount negative={item.type === "expense"}>
                  {item.type === "expense" ? "-" : "+"}
                  {formatCents(item.amount_cents)}
                </ItemAmount>
              </ItemRow>
            ))}
            {period.items.length > 5 && <ItemName>+{period.items.length - 5} itens</ItemName>}
          </>
        )}
      </PeriodCard>
    );
  }

  return (
    <Container>
      <ScreenHeader title="Previsao de Caixa" showBack />

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : data ? (
        <Content>
          <CurrentBalanceCard>
            <CurrentBalanceLabel>Saldo atual</CurrentBalanceLabel>
            <CurrentBalanceAmount>{formatCents(data.current_balance_cents)}</CurrentBalanceAmount>
          </CurrentBalanceCard>

          {data.periods.map(renderPeriod)}

          {data.periods.every((p) => p.items.length === 0) && (
            <EmptyText>
              Sem projecoes disponiveis. Adicione transacoes recorrentes ou parceladas para ver
              previsoes.
            </EmptyText>
          )}
        </Content>
      ) : null}
    </Container>
  );
}
