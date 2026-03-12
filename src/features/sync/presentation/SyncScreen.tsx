import React, { useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../auth/presentation/AuthContext";
import { useSyncStore } from "./useSyncStore";
import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";

import {
  Container,
  Content,
  SyncButton,
  SyncButtonText,
  StatusCard,
  StatusLabel,
  StatusValue,
  PendingBadge,
  PendingBadgeText,
  ResultRow,
  ResultLabel,
  ResultValue,
  ErrorText,
  InfoText,
} from "./SyncScreenStyles";

export function SyncScreen() {
  const { user } = useAuth();
  const {
    isSyncing,
    lastSyncAt,
    pendingCount,
    lastResult,
    error,
    isConfigured,
    initialize,
    sync,
    refreshPendingCount,
  } = useSyncStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  const handleSync = useCallback(() => {
    if (!isConfigured) {
      Alert.alert(
        "Supabase nao configurado",
        "Adicione EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no .env"
      );
      return;
    }
    sync(user.id);
  }, [isConfigured, sync, user.id]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR")}`;
  };

  return (
    <Container>
      <ScreenHeader title="Sincronizacao" showBack />

      <Content>
        <StatusCard>
          <StatusLabel>Status</StatusLabel>
          <StatusValue>
            {!isConfigured ? "Nao configurado" : isSyncing ? "Sincronizando..." : "Pronto"}
          </StatusValue>
        </StatusCard>

        <StatusCard>
          <StatusLabel>Alteracoes pendentes</StatusLabel>
          <PendingBadge hasItems={pendingCount > 0}>
            <PendingBadgeText>{pendingCount}</PendingBadgeText>
          </PendingBadge>
        </StatusCard>

        {lastSyncAt && (
          <StatusCard>
            <StatusLabel>Ultima sincronizacao</StatusLabel>
            <StatusValue>{formatDate(lastSyncAt)}</StatusValue>
          </StatusCard>
        )}

        {lastResult && (
          <StatusCard>
            <StatusLabel>Resultado</StatusLabel>
            <ResultRow>
              <ResultLabel>Enviados:</ResultLabel>
              <ResultValue>{lastResult.pushed}</ResultValue>
            </ResultRow>
            <ResultRow>
              <ResultLabel>Recebidos:</ResultLabel>
              <ResultValue>{lastResult.pulled}</ResultValue>
            </ResultRow>
            {lastResult.conflicts > 0 && (
              <ResultRow>
                <ResultLabel>Conflitos:</ResultLabel>
                <ResultValue>{lastResult.conflicts}</ResultValue>
              </ResultRow>
            )}
            {lastResult.failed > 0 && (
              <ResultRow>
                <ResultLabel>Falhas:</ResultLabel>
                <ResultValue>{lastResult.failed}</ResultValue>
              </ResultRow>
            )}
          </StatusCard>
        )}

        {error && <ErrorText>{error}</ErrorText>}

        {!isConfigured && (
          <InfoText>
            Para ativar a sincronizacao, configure as variaveis de ambiente do Supabase no arquivo
            .env
          </InfoText>
        )}

        <SyncButton onPress={handleSync} disabled={isSyncing || !isConfigured}>
          <SyncButtonText>{isSyncing ? "Sincronizando..." : "Sincronizar agora"}</SyncButtonText>
        </SyncButton>
      </Content>
    </Container>
  );
}
