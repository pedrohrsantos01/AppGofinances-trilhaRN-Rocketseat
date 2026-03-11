import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import { Insight, InsightSeverity } from "../../../shared/domain/entities/Insight";
import { generateInsights } from "../application/generateInsights";

import {
  Container,
  Header,
  BackButton,
  BackIcon,
  Title,
  InsightCard,
  InsightHeader,
  InsightIcon,
  InsightTitle,
  InsightDescription,
  SeverityBadge,
  EmptyText,
  ListContainer,
} from "./InsightListStyles";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

function severityIcon(severity: InsightSeverity): FeatherIconName {
  switch (severity) {
    case "alert":
      return "alert-triangle";
    case "warning":
      return "alert-circle";
    default:
      return "info";
  }
}

function severityLabel(severity: InsightSeverity): string {
  switch (severity) {
    case "alert":
      return "Alerta";
    case "warning":
      return "Atenção";
    default:
      return "Info";
  }
}

export function InsightList() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setIsLoading(true);
        const now = new Date();
        const result = await generateInsights(user.id, now.getMonth(), now.getFullYear());
        // Sort: alerts first, then warnings, then info
        result.sort((a, b) => {
          const order = { alert: 0, warning: 1, info: 2 };
          return order[a.severity] - order[b.severity];
        });
        setInsights(result);
        setIsLoading(false);
      }
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon name="arrow-left" />
        </BackButton>
        <Title>Insights</Title>
      </Header>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ListContainer>
          <FlatList
            data={insights}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <InsightCard severity={item.severity}>
                <InsightHeader>
                  <InsightIcon name={severityIcon(item.severity)} severity={item.severity} />
                  <InsightTitle>{item.title}</InsightTitle>
                  <SeverityBadge severity={item.severity}>
                    {severityLabel(item.severity)}
                  </SeverityBadge>
                </InsightHeader>
                <InsightDescription>{item.description}</InsightDescription>
              </InsightCard>
            )}
            ListEmptyComponent={
              <EmptyText>
                Nenhum insight disponivel. Continue registrando transacoes para receber analises.
              </EmptyText>
            }
            showsVerticalScrollIndicator={false}
          />
        </ListContainer>
      )}
    </Container>
  );
}
