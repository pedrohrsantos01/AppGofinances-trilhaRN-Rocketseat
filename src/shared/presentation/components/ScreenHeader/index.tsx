import React from "react";
import { StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";

import { Container, HeaderRow, BackButton, Title, RightSlot } from "./styles";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, showBack = false, rightAction }: ScreenHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      colors={[theme.colors.gradient_start, theme.colors.gradient_end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: "100%",
        paddingTop: (StatusBar.currentHeight ?? 44) + RFValue(12),
        paddingBottom: RFValue(20),
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <Container>
        <HeaderRow>
          {showBack ? (
            <BackButton onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={RFValue(22)} color={theme.colors.shape} />
            </BackButton>
          ) : (
            <RightSlot />
          )}

          <Title numberOfLines={1}>{title}</Title>

          {rightAction ? <RightSlot>{rightAction}</RightSlot> : <RightSlot />}
        </HeaderRow>
      </Container>
    </LinearGradient>
  );
}
