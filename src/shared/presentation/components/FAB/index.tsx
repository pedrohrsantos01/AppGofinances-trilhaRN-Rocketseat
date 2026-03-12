import React from "react";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";

import { Container } from "./styles";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  const theme = useTheme();

  return (
    <Container onPress={onPress}>
      <Feather name="plus" size={RFValue(24)} color={theme.colors.shape} />
    </Container>
  );
}
