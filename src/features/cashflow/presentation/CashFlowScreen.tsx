import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "styled-components/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import { Money } from "../../../shared/domain/value-objects/Money";
import { getCashFlowProjection, CashFlowResult } from "../application/getCashFlowProjection";
import { ProjectionPeriod } from "../domain/cashFlowRules";
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
            {Money.fromCents(period.projected_balance_cents).toFormatted()}
          </PeriodBalance>
        </PeriodHeader>

        <FlowRow>
          <FlowLabel>Entradas previstas</FlowLabel>
          <FlowValue>+{Money.fromCents(period.income_cents).toFormatted()}</FlowValue>
        </FlowRow>
        <FlowRow>
          <FlowLabel>Saidas previstas</FlowLabel>
          <FlowValue negative>-{Money.fromCents(period.expense_cents).toFormatted()}</FlowValue>
        </FlowRow>

        {period.items.length > 0 && (
          <>
            <Divider />
            {period.items.slice(0, 5).map((item, idx) => (
              <ItemRow key={`${item.name}-${idx}`}>
                <ItemName>{item.name}</ItemName>
                <ItemAmount negative={item.type === "expense"}>
                  {item.type === "expense" ? "-" : "+"}
                  {Money.fromCents(item.amount_cents).toFormatted()}
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
            <CurrentBalanceAmount>
              {Money.fromCents(data.current_balance_cents).toFormatted()}
            </CurrentBalanceAmount>
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
