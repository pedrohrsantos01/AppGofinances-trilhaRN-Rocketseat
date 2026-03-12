import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";

interface ContainerProps {
  color: string;
}

export const Container = styled.View<ContainerProps>`
  width: 100%;

  background-color: ${({ theme }) => theme.colors.surface};

  flex-direction: row;
  justify-content: space-between;

  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;

  border-radius: ${({ theme }) => theme.radius.md}px;
  border-left-width: 4px;
  border-left-color: ${({ color }) => color};

  margin-bottom: ${({ theme }) => theme.spacing.sm}px;

  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.04;
  shadow-radius: 4px;
  elevation: 2;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(15)}px;
`;

export const Amount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(15)}px;
`;
