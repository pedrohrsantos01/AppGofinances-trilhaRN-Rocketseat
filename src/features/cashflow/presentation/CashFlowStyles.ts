import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";

interface BalanceProps {
  negative?: boolean;
}

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: { padding: 24 },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const CurrentBalanceCard = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${RFValue(20)}px;
  margin-bottom: 24px;
`;

export const CurrentBalanceLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.shape};
  opacity: 0.8;
`;

export const CurrentBalanceAmount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(24)}px;
  color: ${({ theme }) => theme.colors.shape};
  margin-top: 4px;
`;

export const PeriodCard = styled.View`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${RFValue(16)}px;
  margin-bottom: 16px;
`;

export const PeriodHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const PeriodLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const PeriodBalance = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(16)}px;
  color: ${({ theme, negative }) => (negative ? theme.colors.attention : theme.colors.sucess)};
`;

export const FlowRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const FlowLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const FlowValue = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme, negative }) => (negative ? theme.colors.attention : theme.colors.sucess)};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.background};
  margin: 8px 0;
`;

export const ItemRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 0;
`;

export const ItemName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

export const ItemAmount = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  color: ${({ theme, negative }) => (negative ? theme.colors.attention : theme.colors.sucess)};
`;

export const EmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-top: 40px;
`;
