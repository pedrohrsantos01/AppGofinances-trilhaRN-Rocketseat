import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";

interface ActiveProps {
  isActive: boolean;
}

export const ModeSelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const ModeButton = styled.TouchableOpacity<ActiveProps>`
  flex: 1;
  padding: 12px 0;
  align-items: center;
  border-radius: 5px;
  margin: 0 4px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.secondary : theme.colors.shape};
`;

export const ModeButtonText = styled.Text<ActiveProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.shape : theme.colors.text)};
`;

export const ExtraFields = styled.View`
  margin-bottom: 8px;
`;

export const ExtraLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

export const FrequencySelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const FrequencyButton = styled.TouchableOpacity<ActiveProps>`
  flex: 1;
  padding: 10px 0;
  align-items: center;
  border-radius: 5px;
  margin: 0 2px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.secondary : theme.colors.shape};
`;

export const FrequencyButtonText = styled.Text<ActiveProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.shape : theme.colors.text)};
`;
