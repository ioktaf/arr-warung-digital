import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv, hasPublicSupabaseEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return null;
  }

  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
