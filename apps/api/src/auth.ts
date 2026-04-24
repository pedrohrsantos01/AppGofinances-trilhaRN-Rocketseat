import { createClient } from "@supabase/supabase-js";
import { AuthenticatedUser } from "./types";

export type AuthVerifier = (token: string) => Promise<AuthenticatedUser | null>;

export function createSupabaseAuthVerifier(): AuthVerifier {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return async () => null;
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return async (token: string) => {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email,
    };
  };
}
