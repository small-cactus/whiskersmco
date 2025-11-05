import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const supabaseUrl =
    env.VITE_SUPABASE_URL ??
    env.NEXT_PUBLIC_SUPABASE_URL ??
    env.PUBLIC_SUPABASE_URL ??
    env.SUPABASE_URL ??
    '';

  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    env.PUBLIC_SUPABASE_ANON_KEY ??
    env.SUPABASE_ANON_KEY ??
    '';

  const define: Record<string, string> = {};

  if (supabaseUrl) {
    process.env.VITE_SUPABASE_URL = supabaseUrl;
    define['import.meta.env.VITE_SUPABASE_URL'] = JSON.stringify(supabaseUrl);
  }

  if (supabaseAnonKey) {
    process.env.VITE_SUPABASE_ANON_KEY = supabaseAnonKey;
    define['import.meta.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(supabaseAnonKey);
  }

  return {
    plugins: [react()],
    define,
  };
});
