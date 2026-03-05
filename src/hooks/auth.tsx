import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

import AsyncStorage from "@react-native-async-storage/async-storage";

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
        responseType: AuthSession.ResponseType.Token,
        // Google rejects PKCE params when using implicit flow (response_type=token).
        usePKCE: false,
        scopes: ["openid", "profile", "email"],
        redirectUri,
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

        const browserResult = await WebBrowser.openAuthSessionAsync(
          startUrl,
          returnUrl
        );

        if (browserResult.type === "cancel" || browserResult.type === "dismiss") {
          throw new Error(GOOGLE_AUTH_CANCELLED);
        }

        if (browserResult.type !== "success") {
          throw new Error(
            `Google auth browser failed with response type: ${browserResult.type}`
          );
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
            ? response.error?.description ??
              response.error?.message ??
              response.params?.error_description ??
              response.params?.error
            : null;

        throw new Error(
          oauthError
            ? `Google auth failed: ${oauthError}`
            : `Google auth failed with response type: ${response.type}`
        );
      }

      const accessToken = response.params.access_token;

      if (!accessToken) {
        throw new Error("Google access token was not returned");
      }

      const userResponse = await fetch(GOOGLE_DISCOVERY.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch Google user profile");
      }

      const userInfo = await userResponse.json();

      const userLogged = {
        id: String(userInfo.id),
        email: String(userInfo.email ?? ""),
        name: String(userInfo.given_name ?? userInfo.name ?? "Usuario"),
        photo: userInfo.picture as string | undefined,
      };

      setUser(userLogged);
      await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
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
        const name = credential.fullName?.givenName ?? "Usuario";
        const photo = `https://ui-avatars.com/api/?name=${name}&length=1`;

        const userLogged = {
          id: String(credential.user),
          email: String(credential.email ?? ""),
          name,
          photo,
        };

        setUser(userLogged);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
      }
    } catch (error) {
      throw new Error(String(error));
    }
  }

  async function signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStoraged = await AsyncStorage.getItem(userStorageKey);

      if (userStoraged) {
        const userLogged = JSON.parse(userStoraged) as User;
        setUser(userLogged);
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
