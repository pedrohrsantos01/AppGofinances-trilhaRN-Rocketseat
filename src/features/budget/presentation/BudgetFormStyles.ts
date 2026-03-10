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

export const BackButton = styled(BorderlessButton)`
  padding: 4px;
`;

export const BackIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(24)}px;
`;

export const HeaderTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.shape};
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  text-align: center;
  margin-right: 28px;
`;

export const Form = styled.View`
  flex: 1;
  padding: 24px;
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
  margin-bottom: 8px;
  margin-top: 16px;
`;

export const AmountInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
  padding: 16px 18px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const CategoryList = styled.View`
  margin-top: 8px;
`;

interface CategoryItemProps {
  isSelected: boolean;
}

export const CategoryItem = styled(RectButton)<CategoryItemProps>`
  flex-direction: row;
  align-items: center;
  padding: 14px 18px;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.secondary_light : theme.colors.shape};
  border-radius: 5px;
  margin-bottom: 8px;
`;

interface CategoryDotProps {
  color: string;
}

export const CategoryDot = styled.View<CategoryDotProps>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ color }) => color};
  margin-right: 12px;
`;

export const CategoryName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const RolloverContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 14px 18px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
`;

export const RolloverLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const SubmitButton = styled(RectButton)`
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 5px;
  padding: 18px;
  align-items: center;
  margin-top: 24px;
`;

export const SubmitText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.shape};
`;
