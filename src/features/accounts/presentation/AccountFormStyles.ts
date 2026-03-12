import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.View`
  flex: 1;
  width: 100%;
  justify-content: space-between;
  padding: 24px;
`;

export const Fields = styled.View``;

export const TypeSelector = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: 16px;
  gap: 8px;
`;

interface TypeOptionProps {
  isActive: boolean;
}

export const TypeOption = styled.TouchableOpacity<TypeOptionProps>`
  padding: 10px 16px;
  border-radius: 5px;
  border-width: ${({ isActive }) => (isActive ? 0 : 1.5)}px;
  border-color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme, isActive }) => (isActive ? theme.colors.primary : "transparent")};
`;

export const TypeOptionText = styled.Text<TypeOptionProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(13)}px;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.shape : theme.colors.text_dark)};
`;

export const Label = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text_dark};
  margin-bottom: 4px;
  margin-top: 12px;
`;
