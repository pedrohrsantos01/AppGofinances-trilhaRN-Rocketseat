import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isSupabaseConfigured } from "../../../shared/infra/supabase/client";
import { getPendingCount } from "../application/syncService";
import { fullSync } from "../infra/SupabaseSync";

const LAST_SYNC_KEY = "@gofinances:last_sync_at";

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingCount: number;
  lastResult: { pushed: number; pulled: number; conflicts: number; failed: number } | null;
  error: string | null;
  isConfigured: boolean;

  initialize: () => Promise<void>;
  sync: (userId: string) => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
  lastResult: null,
  error: null,
  isConfigured: false,

  initialize: async () => {
    const configured = isSupabaseConfigured();
    const stored = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const count = await getPendingCount();
    set({ isConfigured: configured, lastSyncAt: stored, pendingCount: count });
  },

  sync: async (userId: string) => {
    if (get().isSyncing) return;
    if (!isSupabaseConfigured()) {
      set({ error: "Supabase não configurado" });
      return;
    }

    set({ isSyncing: true, error: null });

    try {
      const result = await fullSync(userId, get().lastSyncAt ?? undefined);
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);
      const count = await getPendingCount();

      set({
        isSyncing: false,
        lastSyncAt: now,
        lastResult: result,
        pendingCount: count,
        error: result.failed > 0 ? `${result.failed} item(ns) falharam` : null,
      });
    } catch {
      set({ isSyncing: false, error: "Erro ao sincronizar" });
    }
  },

  refreshPendingCount: async () => {
    const count = await getPendingCount();
    set({ pendingCount: count });
  },
}));
