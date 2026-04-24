import { ApiClient } from "./ApiClient";
import { getSupabaseClient } from "../supabase/client";

export function isApiConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_API_BASE_URL);
}

export function createApiClient(): ApiClient {
  return new ApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
    getAccessToken: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return null;

      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    },
  });
}
