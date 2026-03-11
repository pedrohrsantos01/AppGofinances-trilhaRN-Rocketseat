import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "react-native";

interface ProgressProps {
  percent: number;
}

interface StatusProps {
  delayed?: boolean;
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

export const Title = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.shape};
  text-align: center;
`;

export const AddButton = styled.TouchableOpacity``;

export const AddIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(24)}px;
`;

export const GoalCard = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
  padding: ${RFValue(16)}px;
  margin-bottom: 16px;
`;

export const GoalHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

export const GoalIcon = styled(Feather)`
  font-size: ${RFValue(20)}px;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 12px;
`;

export const GoalName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.title};
  flex: 1;
`;

export const GoalStatus = styled.Text<StatusProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  color: ${({ theme, delayed }) => (delayed ? theme.colors.attention : theme.colors.sucess)};
`;

export const ProgressBarContainer = styled.View`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
`;

export const ProgressBarFill = styled.View<ProgressProps>`
  height: 100%;
  width: ${({ percent }) => Math.min(100, percent)}%;
  background-color: ${({ theme }) => theme.colors.sucess};
  border-radius: 4px;
`;

export const GoalInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const GoalInfoText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const GoalAmount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const EmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-top: 40px;
`;

export const ContributeButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.sucess};
  border-radius: 5px;
  padding: 8px 16px;
  align-self: flex-end;
  margin-top: 8px;
`;

export const ContributeButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.shape};
`;
