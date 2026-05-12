// src/lib/supabase.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "./database.types";

// Read values injected by app.config.ts (extra: { supabaseUrl, supabaseAnonKey })
const extra = Constants.expoConfig?.extra as any;

const supabaseUrl = extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = extra?.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Helpful debug in case config isn't being injected
  // eslint-disable-next-line no-console
  console.log("Expo extra config:", extra);

  throw new Error(
    "Missing Supabase configuration. Ensure app.config.ts sets extra.supabaseUrl and extra.supabaseAnonKey (from .env.local)."
  );
}

/**
 * ✅ Storage adapter that works on:
 * - Android/iOS: AsyncStorage
 * - Web (browser): localStorage (only when window exists)
 * - Web SSR (node): in-memory storage (prevents 'window is not defined')
 */
const createMemoryStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: async (key: string) => (key in store ? store[key] : null),
    setItem: async (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: async (key: string) => {
      delete store[key];
    },
  };
};

const isBrowser = typeof window !== "undefined";

const webStorage = {
  getItem: async (key: string) => (isBrowser ? window.localStorage.getItem(key) : null),
  setItem: async (key: string, value: string) => {
    if (isBrowser) window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isBrowser) window.localStorage.removeItem(key);
  },
};

const nativeStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

const memoryStorage = createMemoryStorage();

const storage = Platform.OS === "web" ? (isBrowser ? webStorage : memoryStorage) : nativeStorage;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});