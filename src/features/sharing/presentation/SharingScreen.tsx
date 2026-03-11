import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";

import { useAuth } from "../../auth/presentation/AuthContext";
import {
  SharedAccess,
  ShareRole as ShareRoleType,
} from "../../../shared/domain/entities/SharedAccess";
import { isSupabaseConfigured } from "../../../shared/infra/supabase/client";
import { SharedAccessRepository } from "../infra/SharedAccessRepository";
import { inviteUser } from "../application/inviteUser";
import { revokeAccess } from "../application/revokeAccess";

import {
  Container,
  Header,
  BackButton,
  BackIcon,
  Title,
  Content,
  SectionTitle,
  InviteRow,
  InviteInput,
  InviteButton,
  InviteButtonText,
  ShareCard,
  ShareInfo,
  ShareEmail,
  ShareRole,
  StatusBadge,
  RevokeButton,
  RevokeIcon,
  EmptyText,
  RolePicker,
  RoleOption,
  RoleOptionText,
  NotConfiguredText,
} from "./SharingStyles";

const repo = new SharedAccessRepository();

export function SharingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [shares, setShares] = useState<SharedAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ShareRoleType>("viewer");
  const [isSending, setIsSending] = useState(false);
  const configured = isSupabaseConfigured();

  useFocusEffect(
    useCallback(() => {
      if (!configured) {
        setIsLoading(false);
        return;
      }
      async function load() {
        setIsLoading(true);
        const list = await repo.listByOwner(user.id);
        setShares(list.filter((s) => s.status !== "rejected"));
        setIsLoading(false);
      }
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  async function handleInvite() {
    if (isSending) return;
    setIsSending(true);
    try {
      await inviteUser(user.id, email.trim(), role);
      setEmail("");
      const list = await repo.listByOwner(user.id);
      setShares(list.filter((s) => s.status !== "rejected"));
      Alert.alert("Convite enviado", `Compartilhamento enviado para ${email.trim()}`);
    } catch (err: any) {
      Alert.alert("Erro", err.message ?? "Erro ao enviar convite");
    } finally {
      setIsSending(false);
    }
  }

  function handleRevoke(share: SharedAccess) {
    Alert.alert("Revogar acesso", `Remover acesso de ${share.shared_with_email}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Revogar",
        style: "destructive",
        onPress: async () => {
          await revokeAccess(share);
          setShares((prev) =>
            prev.map((s) => (s.id === share.id ? { ...s, status: "revoked" } : s))
          );
        },
      },
    ]);
  }

  function statusLabel(status: SharedAccess["status"]) {
    switch (status) {
      case "accepted":
        return "Ativo";
      case "pending":
        return "Pendente";
      case "revoked":
        return "Revogado";
      default:
        return status;
    }
  }

  function roleLabel(r: ShareRoleType) {
    return r === "editor" ? "Editor" : "Visualizador";
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon name="arrow-left" />
        </BackButton>
        <Title>Compartilhamento</Title>
      </Header>

      {!configured ? (
        <NotConfiguredText>
          Compartilhamento requer Supabase configurado. Adicione EXPO_PUBLIC_SUPABASE_URL e
          EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env para habilitar.
        </NotConfiguredText>
      ) : isLoading ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <Content>
          <SectionTitle>Convidar</SectionTitle>

          <RolePicker>
            <RoleOption selected={role === "viewer"} onPress={() => setRole("viewer")}>
              <RoleOptionText selected={role === "viewer"}>Visualizador</RoleOptionText>
            </RoleOption>
            <RoleOption selected={role === "editor"} onPress={() => setRole("editor")}>
              <RoleOptionText selected={role === "editor"}>Editor</RoleOptionText>
            </RoleOption>
          </RolePicker>

          <InviteRow>
            <InviteInput
              placeholder="Email do convidado"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InviteButton onPress={handleInvite} disabled={isSending}>
              <InviteButtonText>{isSending ? "..." : "Convidar"}</InviteButtonText>
            </InviteButton>
          </InviteRow>

          <SectionTitle>Compartilhados</SectionTitle>

          {shares.length === 0 ? (
            <EmptyText>Nenhum compartilhamento ativo.</EmptyText>
          ) : (
            shares.map((share) => (
              <ShareCard key={share.id}>
                <ShareInfo>
                  <ShareEmail>{share.shared_with_email}</ShareEmail>
                  <ShareRole>{roleLabel(share.role)}</ShareRole>
                </ShareInfo>
                <StatusBadge variant={share.status as "accepted" | "pending" | "revoked"}>
                  {statusLabel(share.status)}
                </StatusBadge>
                {share.status !== "revoked" && (
                  <RevokeButton onPress={() => handleRevoke(share)}>
                    <RevokeIcon name="x-circle" />
                  </RevokeButton>
                )}
              </ShareCard>
            ))
          )}
        </Content>
      )}
    </Container>
  );
}
