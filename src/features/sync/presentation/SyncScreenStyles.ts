import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import { StatusBar } from "react-native";

interface PendingProps {
  hasItems: boolean;
}

interface DisabledProps {
  disabled?: boolean;
}

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  height: ${(StatusBar.currentHeight ?? 44) + RFValue(60)}px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 19px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.shape};
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: { padding: 24 },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const StatusCard = styled.View`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
  padding: ${RFValue(16)}px;
  margin-bottom: 16px;
`;

export const StatusLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

export const StatusValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const PendingBadge = styled.View<PendingProps>`
  background-color: ${({ hasItems, theme }) =>
    hasItems ? theme.colors.attention : theme.colors.sucess};
  border-radius: 12px;
  padding: 4px 12px;
  align-self: flex-start;
  margin-top: 4px;
`;

export const PendingBadgeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.shape};
`;

export const ResultRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 4px;
`;

export const ResultLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const ResultValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const ErrorText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.attention};
  margin-bottom: 16px;
`;

export const InfoText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
  line-height: ${RFValue(20)}px;
`;

export const SyncButton = styled.TouchableOpacity<DisabledProps>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.text : theme.colors.primary};
  border-radius: 5px;
  padding: ${RFValue(16)}px;
  align-items: center;
  margin-top: 8px;
`;

export const SyncButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.shape};
`;
