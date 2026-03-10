import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";
import { BorderlessButton, RectButton } from "react-native-gesture-handler";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  height: ${RFValue(113)}px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 19px;
  flex-direction: row;
  padding-left: 24px;
  padding-right: 24px;
`;

export const HeaderTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.shape};
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  text-align: center;
`;

export const AddButton = styled(BorderlessButton)`
  padding: 4px;
`;

export const AddIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(24)}px;
`;

export const Content = styled.View`
  flex: 1;
  padding: 24px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(15)}px;
  color: ${({ theme }) => theme.colors.text_dark};
  margin-bottom: 12px;
`;

export const ReminderCard = styled.View`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
  padding: 17px 24px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

interface UrgencyIndicatorProps {
  color: string;
}

export const UrgencyIndicator = styled.View<UrgencyIndicatorProps>`
  width: 4px;
  height: 100%;
  min-height: 40px;
  border-radius: 2px;
  background-color: ${({ color }) => color};
  margin-right: 16px;
`;

export const ReminderInfo = styled.View`
  flex: 1;
`;

export const ReminderTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const ReminderDate = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 2px;
`;

export const ReminderAmount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const CompleteButton = styled(RectButton)`
  padding: 8px;
  margin-left: 8px;
`;

export const CompleteIcon = styled(Feather)`
  font-size: ${RFValue(20)}px;
  color: ${({ theme }) => theme.colors.sucess};
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
