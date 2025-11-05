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

const getImportMetaEnv = (): EnvRecord => {
  try {
    return (import.meta.env ?? {}) as EnvRecord;
  } catch {
    return {};
  }
};

const getProcessEnv = (): EnvRecord => {
  const globalProcess = (globalThis as { process?: { env?: EnvRecord } }).process;
  return globalProcess?.env ?? {};
};

const normalize = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readEnv = (keys: string[]): string | undefined => {
  const sources: EnvRecord[] = [getImportMetaEnv(), getProcessEnv()];

  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const match = normalize(source[key]);
      if (match) return match;
    }
  }

  if (typeof window !== 'undefined' && window.__SUPABASE__) {
    const { url, anonKey } = window.__SUPABASE__;
    for (const key of keys) {
      if (key.toLowerCase().includes('url')) {
        const match = normalize(url);
        if (match) return match;
      }
      if (key.toLowerCase().includes('anon')) {
        const match = normalize(anonKey);
        if (match) return match;
      }
    }
  }

  return undefined;
};

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let cachedConfig: SupabaseConfig | null = null;
let client: SupabaseClient | null = null;

const resolveConfig = (): SupabaseConfig | null => {
  const url =
    readEnv(['VITE_SUPABASE_URL', 'PUBLIC_SUPABASE_URL', 'SUPABASE_URL']) ?? '';
  const anonKey =
    readEnv(['VITE_SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']) ?? '';

  if (!url || !anonKey) return null;
  return { url, anonKey };
};

export const isSupabaseConfigured = () => Boolean(resolveConfig());

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = resolveConfig();
  if (!config) return null;

  const hasChanged =
    !cachedConfig ||
    cachedConfig.url !== config.url ||
    cachedConfig.anonKey !== config.anonKey;

  if (!client || hasChanged) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedConfig = config;
  }

  return client;
};

export const getSupabaseConfigSummary = () => {
  const config = resolveConfig();
  return {
    url: config?.url ?? '',
    anonKey: config?.anonKey ? '****' : '',
    isConfigured: Boolean(config),
  };
};
