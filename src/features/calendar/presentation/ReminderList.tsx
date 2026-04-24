import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { useTheme } from "styled-components/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAuth } from "../../auth/presentation/AuthContext";
import { formatCents } from "../../../shared/application/formatMoney";
import { ReminderRepository } from "../infra/ReminderRepository";
import type { UpcomingDue } from "../domain/upcomingDues";
import { getUpcomingDues } from "../application/getUpcomingDues";

import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";
import {
  Container,
  AddButton,
  AddIcon,
  Content,
  SectionTitle,
  ReminderCard,
  UrgencyIndicator,
  ReminderInfo,
  ReminderTitle,
  ReminderDate,
  ReminderAmount,
  CompleteButton,
  CompleteIcon,
  EmptyContainer,
  EmptyText,
  EmptyIcon,
  LoadContainer,
} from "./ReminderListStyles";

const reminderRepo = new ReminderRepository();

function getUrgencyColor(dueDate: string): string {
  const diff = differenceInDays(parseISO(dueDate), new Date());
  if (diff <= 1) return "#E83F5B";
  if (diff <= 3) return "#FF872C";
  return "#12A454";
}

export function ReminderList() {
  const [upcoming, setUpcoming] = useState<UpcomingDue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  async function loadReminders() {
    setIsLoading(true);
    const data = await getUpcomingDues(user.id, 30);
    setUpcoming(data);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadReminders();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  async function handleComplete(id: string) {
    await reminderRepo.markCompleted(id);
    loadReminders();
  }

  function handleAddReminder() {
    navigation.navigate("ReminderForm");
  }

  function renderReminder({ item }: { item: UpcomingDue }) {
    const amount = formatCents(item.amount_cents);
    const dateFormatted = format(parseISO(item.due_date), "dd 'de' MMMM", {
      locale: ptBR,
    });

    return (
      <ReminderCard>
        <UrgencyIndicator color={getUrgencyColor(item.due_date)} />
        <ReminderInfo>
          <ReminderTitle>{item.title}</ReminderTitle>
          <ReminderDate>{dateFormatted}</ReminderDate>
        </ReminderInfo>
        <ReminderAmount>{amount}</ReminderAmount>
        <CompleteButton onPress={() => handleComplete(item.id)}>
          <CompleteIcon name="check-circle" />
        </CompleteButton>
      </ReminderCard>
    );
  }

  return (
    <Container>
      <ScreenHeader
        title="Vencimentos"
        rightAction={
          <AddButton onPress={handleAddReminder}>
            <AddIcon name="plus" />
          </AddButton>
        }
      />

      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : upcoming.length === 0 ? (
        <EmptyContainer>
          <EmptyIcon name="calendar" />
          <EmptyText>Nenhum vencimento próximo.{"\n"}Toque em + para adicionar.</EmptyText>
        </EmptyContainer>
      ) : (
        <Content>
          <SectionTitle>Próximos 30 dias</SectionTitle>
          <FlatList
            data={upcoming}
            keyExtractor={(item) => item.id}
            renderItem={renderReminder}
            showsVerticalScrollIndicator={false}
          />
        </Content>
      )}
    </Container>
  );
}
