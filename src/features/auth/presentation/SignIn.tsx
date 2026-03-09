import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform } from "react-native";
import { useTheme } from "styled-components/native";

import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper,
} from "./SignInStyles";

import { SignInSocialButton } from "../../../shared/presentation/components/SignInSocialButton";

import AppleSvg from "../../../shared/assets/apple.svg";
import GoogleSvg from "../../../shared/assets/google.svg";
import LogoSvg from "../../../shared/assets/logo.svg";
import { RFValue } from "react-native-responsive-fontsize";
import { useAuth } from "./AuthContext";

const GOOGLE_AUTH_CANCELLED = "GOOGLE_AUTH_CANCELLED";

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const { signInWithGoogle, signInWithApple } = useAuth();
  const theme = useTheme();

  async function handleSignInWithGoogle() {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google auth failed";

      if (errorMessage === GOOGLE_AUTH_CANCELLED) {
        return;
      }

      console.log(error);
      Alert.alert("Nao foi possivel conectar a conta Google", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignInWithApple() {
    try {
      setIsLoading(true);
      await signInWithApple();
    } catch (error) {
      console.log(error);
      Alert.alert("Nao foi possivel conectar a conta Apple");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg width={RFValue(120)} height={RFValue(68)} />
          <Title>
            Controle suas {"\n"}
            financas de forma {"\n"}
            muito simples
          </Title>
        </TitleWrapper>
        <SignInTitle>
          Faca seu login com {"\n"}
          uma das contas abaixo
        </SignInTitle>
      </Header>
      <Footer>
        <FooterWrapper>
          <SignInSocialButton
            title="Entrar com Google"
            svg={GoogleSvg}
            onPress={handleSignInWithGoogle}
          />

          {Platform.OS === "ios" && (
            <SignInSocialButton
              title="Entrar com Apple"
              svg={AppleSvg}
              onPress={handleSignInWithApple}
            />
          )}
        </FooterWrapper>

        {isLoading && <ActivityIndicator color={theme.colors.shape} style={{ marginTop: 18 }} />}
      </Footer>
    </Container>
  );
}
