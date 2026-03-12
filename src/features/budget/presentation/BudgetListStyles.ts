import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";
import { BorderlessButton } from "react-native-gesture-handler";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const AddButton = styled(BorderlessButton)`
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

export const AddIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(24)}px;
`;

export const MonthSelector = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
`;

export const MonthButton = styled(BorderlessButton)`
  padding: 4px;
`;

export const MonthIcon = styled(Feather)`
  font-size: ${RFValue(24)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const MonthText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(16)}px;
  color: ${({ theme }) => theme.colors.text_dark};
  margin: 0 16px;
`;

export const Content = styled.View`
  flex: 1;
  padding: 0 24px;
`;

export const BudgetCard = styled.View`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: 17px ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  elevation: 3;
`;

export const BudgetHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

interface ColorDotProps {
  color: string;
}

export const CategoryDot = styled.View<ColorDotProps>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ color }) => color};
  margin-right: 8px;
`;

export const CategoryName = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const BudgetAmount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const ProgressBarContainer = styled.View`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
`;

interface ProgressFillProps {
  percent: number;
  alertColor: string;
}

export const ProgressFill = styled.View<ProgressFillProps>`
  height: 100%;
  width: ${({ percent }) => Math.min(percent, 100)}%;
  background-color: ${({ alertColor }) => alertColor};
  border-radius: 4px;
`;

export const BudgetFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const SpentText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const RemainingText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const EmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-top: 16px;
`;

export const EmptyIcon = styled(Feather)`
  font-size: ${RFValue(48)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const LoadContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
