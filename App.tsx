import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { ThemeProvider } from "styled-components/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import theme from "./src/shared/presentation/theme/theme";
import { Routes } from "./src/navigation";
import { AuthProvider, useAuth } from "./src/features/auth/presentation/AuthContext";

function AppBootstrap() {
  const { isUserStorageLoading } = useAuth();

  if (isUserStorageLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return <Routes />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <AuthProvider>
          <AppBootstrap />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
