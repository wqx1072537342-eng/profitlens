"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./env";
import type { Database } from "./types";

export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient<Database>(config.url, config.anonKey);
}

