import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import theme from "../../../shared/presentation/theme/theme";

interface ActiveProps {
  isActive: boolean;
}

interface ColorProps {
  color: string;
}

export const AccountItem = styled.TouchableOpacity<ActiveProps>`
  width: 100%;
  padding: ${RFValue(15)}px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ isActive }) =>
    isActive ? theme.colors.secondary_light : theme.colors.background};
`;

export const AccountColorDot = styled.View<ColorProps>`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: ${({ color }) => color};
  margin-right: 16px;
`;

export const AccountItemName = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
`;
