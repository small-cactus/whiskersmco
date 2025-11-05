import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __SUPABASE__?: {
      url?: string;
      anonKey?: string;
    };
  }
}

type EnvRecord = Record<string, string | undefined>;

const env = import.meta.env as EnvRecord;

const readEnv = (keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = env[key];
    if (value) return value;
  }

  if (typeof window !== 'undefined' && window.__SUPABASE__) {
    for (const key of keys) {
      const value = window.__SUPABASE__[key as keyof typeof window.__SUPABASE__];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }
  }

  return undefined;
};

const supabaseUrl =
  readEnv(['VITE_SUPABASE_URL', 'PUBLIC_SUPABASE_URL', 'SUPABASE_URL']) ?? '';
const supabaseAnonKey =
  readEnv(['VITE_SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']) ?? '';

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey);

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
};

export const getSupabaseConfigSummary = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? '****' : '',
  isConfigured: isSupabaseConfigured(),
});
