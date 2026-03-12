import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";

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

export const AddButton = styled.TouchableOpacity``;

export const AddIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(24)}px;
`;

export const GoalCard = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${RFValue(16)}px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 4px;
  elevation: 2;
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
