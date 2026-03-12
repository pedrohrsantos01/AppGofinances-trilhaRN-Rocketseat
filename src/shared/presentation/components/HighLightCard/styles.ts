import styled, { css } from "styled-components/native";
import { Feather } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

interface TypeProps {
  type: "up" | "down" | "total";
}

const accentColor = {
  up: (theme: any) => theme.colors.sucess,
  down: (theme: any) => theme.colors.attention,
  total: (theme: any) => theme.colors.primary,
};

export const Container = styled.View<TypeProps>`
  background-color: ${({ theme, type }) =>
    type === "total" ? theme.colors.primary : theme.colors.surface};

  width: ${RFValue(300)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;

  padding: ${({ theme }) => theme.spacing.lg}px;
  padding-bottom: ${RFValue(32)}px;
  margin-right: ${({ theme }) => theme.spacing.md}px;

  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;

  ${({ type, theme }) =>
    type !== "total" &&
    css`
      border-left-width: 4px;
      border-left-color: ${accentColor[type](theme)};
    `}
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.Text<TypeProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;

  color: ${({ theme, type }) => (type === "total" ? theme.colors.shape : theme.colors.text)};
`;

export const Icon = styled(Feather as any)<TypeProps>`
  font-size: ${RFValue(28)}px;

  ${(props) =>
    props.type === "up" &&
    css`
      color: ${({ theme }) => theme.colors.sucess};
    `}

  ${(props) =>
    props.type === "down" &&
    css`
      color: ${({ theme }) => theme.colors.attention};
    `}

  ${(props) =>
    props.type === "total" &&
    css`
      color: ${({ theme }) => theme.colors.shape};
    `}
`;

export const Footer = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

export const Amount = styled.Text<TypeProps>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(28)}px;

  color: ${({ theme, type }) => (type === "total" ? theme.colors.shape : theme.colors.title)};
`;

export const LastTransaction = styled.Text<TypeProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;

  color: ${({ theme, type }) => (type === "total" ? theme.colors.shape : theme.colors.text)};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;
