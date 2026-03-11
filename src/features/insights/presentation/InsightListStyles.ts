import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "react-native";

interface SeverityProps {
  severity: "info" | "warning" | "alert";
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
  flex-direction: row;
  padding-left: 24px;
  padding-right: 24px;
`;

export const BackButton = styled.TouchableOpacity``;

export const BackIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(24)}px;
`;

export const Title = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.shape};
  text-align: center;
  margin-right: ${RFValue(24)}px;
`;

export const InsightCard = styled.View<SeverityProps>`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
  padding: ${RFValue(16)}px;
  margin-bottom: 16px;
  border-left-width: 4px;
  border-left-color: ${({ theme, severity }) =>
    severity === "alert"
      ? theme.colors.attention
      : severity === "warning"
        ? "#FF872C"
        : theme.colors.sucess};
`;

export const InsightHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

export const InsightIcon = styled(Feather)<SeverityProps>`
  font-size: ${RFValue(18)}px;
  color: ${({ theme, severity }) =>
    severity === "alert"
      ? theme.colors.attention
      : severity === "warning"
        ? "#FF872C"
        : theme.colors.sucess};
  margin-right: 12px;
`;

export const InsightTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.title};
  flex: 1;
`;

export const InsightDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
  line-height: ${RFValue(18)}px;
`;

export const SeverityBadge = styled.Text<SeverityProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(10)}px;
  color: ${({ theme }) => theme.colors.shape};
  background-color: ${({ theme, severity }) =>
    severity === "alert"
      ? theme.colors.attention
      : severity === "warning"
        ? "#FF872C"
        : theme.colors.sucess};
  padding: 2px 8px;
  border-radius: 10px;
  overflow: hidden;
`;

export const EmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-top: 40px;
`;

export const ListContainer = styled.View`
  flex: 1;
  padding: 0 24px;
  padding-top: 24px;
`;
