import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig } from "./env";
import type { Database } from "./types";

export function createSupabaseAdminClient() {
  const config = getSupabaseAdminConfig();

  if (!config) {
    return null;
  }

  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
