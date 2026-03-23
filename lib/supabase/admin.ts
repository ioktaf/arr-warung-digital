import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv, hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  if (!hasServiceRoleSupabaseEnv()) {
    return null;
  }

  const { url, serviceRoleKey } = getSupabaseEnv();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
