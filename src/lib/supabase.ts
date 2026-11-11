import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://rbggrorztvuufdoauomk.supabase.co";
const DEFAULT_SUPABASE_KEY =
  "sb_publishable_Mv-77oS2xifQC7BYvSE-rQ_m9-HgQqK";

let cachedClient: SupabaseClient | null = null;
let cachedKey = "";

export function getSupabaseConfig(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
} {
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  if (typeof window !== "undefined") {
    const savedUrl = localStorage.getItem("kv_supabase_url") || "";
    const savedKey = localStorage.getItem("kv_supabase_anon_key") || "";
    if (savedUrl && savedKey) {
      return { url: savedUrl, anonKey: savedKey, isConfigured: true };
    }
  }

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, isConfigured: true };
  }

  return { url: "", anonKey: "", isConfigured: false };
}

export function saveRuntimeSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("kv_supabase_url", url.trim());
    localStorage.setItem("kv_supabase_anon_key", anonKey.trim());
    cachedClient = null;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const keySignature = `${url}::${anonKey}`;
  if (!cachedClient || cachedKey !== keySignature) {
    cachedClient = createClient(url, anonKey);
    cachedKey = keySignature;
  }
  return cachedClient;
}
