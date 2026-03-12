import React, { useCallback, useState } from "react";
import { FlatList, Alert, TextInput, Modal, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import { Goal } from "../../../shared/domain/entities/Goal";
import { Money } from "../../../shared/domain/value-objects/Money";
import { listGoals } from "../application/listGoals";
import { contributeToGoal } from "../application/contributeToGoal";
import { goalProgress, isGoalDelayed, daysUntilTarget } from "../domain/goalRules";

import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";
import {
  Container,
  AddButton,
  AddIcon,
  GoalCard,
  GoalHeader,
  GoalIcon,
  GoalName,
  GoalStatus,
  ProgressBarContainer,
  ProgressBarFill,
  GoalInfo,
  GoalInfoText,
  GoalAmount,
  EmptyText,
  ContributeButton,
  ContributeButtonText,
} from "./GoalListStyles";

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const loadGoals = useCallback(async () => {
    const data = await listGoals(user.id);
    setGoals(data);
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  function handleContributePress(goalId: string) {
    setSelectedGoalId(goalId);
    setContributeAmount("");
    setContributeModalVisible(true);
  }

  async function handleConfirmContribution() {
    if (!selectedGoalId || !contributeAmount) return;

    const cents = Math.round(parseFloat(contributeAmount.replace(",", ".")) * 100);
    if (isNaN(cents) || cents <= 0) {
      Alert.alert("Valor invalido");
      return;
    }

    try {
      await contributeToGoal(selectedGoalId, cents);
      setContributeModalVisible(false);
      loadGoals();
    } catch (error: any) {
      Alert.alert(error.message ?? "Erro ao contribuir");
    }
  }

  function getStatusLabel(goal: Goal): string {
    if (goal.status === "completed") return "Concluida";
    if (goal.status === "paused") return "Pausada";
    if (goal.status === "cancelled") return "Cancelada";
    const days = daysUntilTarget(goal.target_date);
    if (days !== null && days === 0) return "Prazo vencido";
    if (days !== null) return `${days} dias restantes`;
    return "Ativa";
  }

  return (
    <Container>
      <ScreenHeader
        title="Metas"
        rightAction={
          <AddButton onPress={() => navigation.navigate("GoalForm")}>
            <AddIcon name="plus" />
          </AddButton>
        }
      />

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyText>Nenhuma meta cadastrada</EmptyText>}
        renderItem={({ item }) => {
          const progress = goalProgress(item.current_cents, item.target_cents);
          const delayed = isGoalDelayed(item.current_cents, item.target_cents, item.target_date);

          return (
            <GoalCard activeOpacity={0.7}>
              <GoalHeader>
                <GoalIcon name={item.icon as any} />
                <GoalName>{item.name}</GoalName>
                <GoalStatus delayed={delayed}>{getStatusLabel(item)}</GoalStatus>
              </GoalHeader>

              <ProgressBarContainer>
                <ProgressBarFill percent={progress} />
              </ProgressBarContainer>

              <GoalInfo>
                <GoalInfoText>{progress}%</GoalInfoText>
                <GoalAmount>
                  {Money.fromCents(item.current_cents).toFormatted()} /{" "}
                  {Money.fromCents(item.target_cents).toFormatted()}
                </GoalAmount>
              </GoalInfo>

              {item.status === "active" && (
                <ContributeButton onPress={() => handleContributePress(item.id)}>
                  <ContributeButtonText>Contribuir</ContributeButtonText>
                </ContributeButton>
              )}
            </GoalCard>
          );
        }}
      />

      <Modal visible={contributeModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              width: "80%",
            }}
          >
            <GoalName style={{ marginBottom: 16 }}>Valor da contribuicao</GoalName>
            <TextInput
              placeholder="0,00"
              keyboardType="numeric"
              value={contributeAmount}
              onChangeText={setContributeAmount}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                padding: 12,
                fontSize: 16,
                marginBottom: 16,
              }}
              autoFocus
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <ContributeButton
                onPress={() => setContributeModalVisible(false)}
                style={{ backgroundColor: "#969cb2" }}
              >
                <ContributeButtonText>Cancelar</ContributeButtonText>
              </ContributeButton>
              <ContributeButton onPress={handleConfirmContribution}>
                <ContributeButtonText>Confirmar</ContributeButtonText>
              </ContributeButton>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}
