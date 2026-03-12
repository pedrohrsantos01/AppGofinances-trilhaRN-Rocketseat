import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: space-between;
`;

export const Fields = styled.View`
  gap: 8px;
`;
