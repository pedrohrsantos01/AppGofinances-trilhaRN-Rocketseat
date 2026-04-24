import React, { useState } from "react";
import { Alert, ActivityIndicator, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useAuth } from "../../auth/presentation/AuthContext";
import { processCSVImport } from "../application/importTransactions";
import { exportToCSV } from "../application/exportTransactions";
import { TransactionRepository } from "../../transactions/infra/TransactionRepository";
import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";
import { getDefaultAccountId } from "../../../shared/infra/database/seedDefaultAccount";

import {
  Container,
  Content,
  Section,
  SectionTitle,
  SectionDescription,
  ActionButton,
  ActionIcon,
  ActionText,
  ResultContainer,
  ResultText,
  ErrorText,
  LoadContainer,
} from "./ImportExportStyles";

const transactionRepo = new TransactionRepository();

export function ImportExportScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    duplicates: number;
    errors: { line: number; message: string }[];
  } | null>(null);
  const theme = useTheme();
  const { user } = useAuth();

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "text/csv",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    setIsProcessing(true);
    setImportResult(null);

    const asset = result.assets[0];
    const pickedFile = new File(asset.uri);
    const content = await pickedFile.text();

    const { transactions, result: importRes } = processCSVImport(
      content,
      {
        date: "data",
        name: "descricao",
        amount: "valor",
        type: "tipo",
      },
      user.id,
      getDefaultAccountId(user.id),
      "purchases"
    );

    if (transactions.length > 0) {
      await transactionRepo.createMany(transactions);
    }

    setImportResult(importRes);
    setIsProcessing(false);
  }

  async function handleExport() {
    setIsProcessing(true);

    const now = new Date();
    const transactions = await transactionRepo.listByUser(user.id, {
      month: now.getMonth(),
      year: now.getFullYear(),
    });

    const csv = exportToCSV(transactions);
    const exportFile = new File(Paths.cache, "gofinances-export.csv");
    exportFile.write(csv);

    setIsProcessing(false);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(exportFile.uri);
    } else {
      Alert.alert("Exportado", `Arquivo salvo em ${exportFile.uri}`);
    }
  }

  if (isProcessing) {
    return (
      <Container>
        <ScreenHeader title="Importar / Exportar" showBack />
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ScreenHeader title="Importar / Exportar" showBack />

      <ScrollView>
        <Content>
          <Section>
            <SectionTitle>Importar CSV</SectionTitle>
            <SectionDescription>
              Selecione um arquivo CSV com colunas: data, descricao, valor, tipo
            </SectionDescription>
            <ActionButton onPress={handleImport}>
              <ActionIcon name="upload" />
              <ActionText>Selecionar arquivo</ActionText>
            </ActionButton>

            {importResult && (
              <ResultContainer>
                <ResultText>Importadas: {importResult.imported} transações</ResultText>
                {importResult.duplicates > 0 && (
                  <ResultText>Duplicatas removidas: {importResult.duplicates}</ResultText>
                )}
                {importResult.errors.map((err, i) => (
                  <ErrorText key={i}>
                    Linha {err.line}: {err.message}
                  </ErrorText>
                ))}
              </ResultContainer>
            )}
          </Section>

          <Section>
            <SectionTitle>Exportar CSV</SectionTitle>
            <SectionDescription>Exporta as transações do mês atual para CSV</SectionDescription>
            <ActionButton onPress={handleExport}>
              <ActionIcon name="download" />
              <ActionText>Exportar transações</ActionText>
            </ActionButton>
          </Section>
        </Content>
      </ScrollView>
    </Container>
  );
}
