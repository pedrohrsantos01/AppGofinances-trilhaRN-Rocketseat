import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "../../../shared/infra/startup";
import { clearLocalUserData } from "../../../shared/infra/security/clearLocalUserData";
import { getSupabaseClient } from "../../../shared/infra/supabase/client";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI;
const GOOGLE_AUTH_CANCELLED = "GOOGLE_AUTH_CANCELLED";
const EXPO_AUTH_PROXY_BASE_URL = "https://auth.expo.io/";
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
  userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
};

WebBrowser.maybeCompleteAuthSession();

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  isUserStorageLoading: boolean;
}

const AuthContext = createContext({} as AuthContextData);

function mapSupabaseUser(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const metadata = authUser.user_metadata ?? {};
  const name = metadata.given_name ?? metadata.name ?? "Usuario";
  const photo = metadata.avatar_url ?? metadata.picture;

  return {
    id: authUser.id,
    email: String(authUser.email ?? ""),
    name: String(name),
    photo: typeof photo === "string" ? photo : undefined,
  };
}

async function signInSupabaseWithIdToken(
  provider: "google" | "apple",
  token: string
): Promise<User> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase Auth nao configurado");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider,
    token,
  });

  if (error || !data.user) {
    throw error ?? new Error("Supabase Auth nao retornou usuario");
  }

  return mapSupabaseUser(data.user);
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [isUserStorageLoading, setIsUserStorageLoading] = useState(true);

  const userStorageKey = "@gofinances:user";

  async function signInWithGoogle() {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error("Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID");
    }

    try {
      const proxyRedirectUri = GOOGLE_REDIRECT_URI?.trim();
      const appRedirectUri = AuthSession.makeRedirectUri({
        scheme: "gofinances",
        path: "auth",
      });
      const redirectUri = proxyRedirectUri ?? appRedirectUri;

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        responseType: AuthSession.ResponseType.IdToken,
        // Google rejects PKCE params when using implicit/id_token flow.
        usePKCE: false,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        extraParams: {
          nonce: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
      });

      let response: AuthSession.AuthSessionResult;
      const isUsingExpoProxy =
        typeof proxyRedirectUri === "string" &&
        proxyRedirectUri.startsWith(EXPO_AUTH_PROXY_BASE_URL);

      if (isUsingExpoProxy) {
        const authUrl = await request.makeAuthUrlAsync(GOOGLE_DISCOVERY);
        const returnUrl = AuthSession.getDefaultReturnUrl();
        const normalizedProxyRedirectUri = proxyRedirectUri.replace(/\/+$/, "");
        const startUrl =
          `${normalizedProxyRedirectUri}/start?` +
          new URLSearchParams({
            authUrl,
            returnUrl,
          }).toString();

        const browserResult = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);

        if (browserResult.type === "cancel" || browserResult.type === "dismiss") {
          throw new Error(GOOGLE_AUTH_CANCELLED);
        }

        if (browserResult.type !== "success") {
          throw new Error(`Google auth browser failed with response type: ${browserResult.type}`);
        }

        response = request.parseReturnUrl(browserResult.url);
      } else {
        response = await request.promptAsync(GOOGLE_DISCOVERY);
      }

      if (response.type === "cancel" || response.type === "dismiss") {
        throw new Error(GOOGLE_AUTH_CANCELLED);
      }

      if (response.type !== "success") {
        const oauthError =
          response.type === "error"
            ? (response.error?.description ??
              response.error?.message ??
              response.params?.error_description ??
              response.params?.error)
            : null;

        throw new Error(
          oauthError
            ? `Google auth failed: ${oauthError}`
            : `Google auth failed with response type: ${response.type}`
        );
      }

      const idToken = response.params.id_token;

      if (!idToken) {
        throw new Error("Google id token was not returned");
      }

      const userLogged = await signInSupabaseWithIdToken("google", idToken);

      setUser(userLogged);
      await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
      await initializeApp(userLogged.id);
    } catch (error) {
      if (__DEV__) {
        console.log("Google SignIn debug", {
          appOwnership: Constants.appOwnership,
          originalFullName: Constants.expoConfig?.originalFullName,
          redirectUri: GOOGLE_REDIRECT_URI?.trim() ?? "(generated at runtime)",
          error,
        });
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Google auth failed");
    }
  }

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential) {
        if (!credential.identityToken) {
          throw new Error("Apple identity token was not returned");
        }

        const userLogged = await signInSupabaseWithIdToken("apple", credential.identityToken);

        setUser(userLogged);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
        await initializeApp(userLogged.id);
      }
    } catch (error) {
      throw new Error(String(error));
    }
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
    if (user.id) {
      await clearLocalUserData(user.id);
    }
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStoraged = await AsyncStorage.getItem(userStorageKey);

      if (userStoraged) {
        const userLogged = JSON.parse(userStoraged) as User;
        setUser(userLogged);
        await initializeApp(userLogged.id);
      }
      setIsUserStorageLoading(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signInWithApple,
        signOut,
        isUserStorageLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { useAuth, AuthProvider };
