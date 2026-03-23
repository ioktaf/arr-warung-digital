import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getStoreSettings } from "@/lib/data";
import {
  hasPublicSupabaseEnv,
  hasServiceRoleSupabaseEnv,
} from "@/lib/supabase/env";
import type { StoreSettings } from "@/types/domain";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings: StoreSettings = await getStoreSettings();
  const publicEnvReady = hasPublicSupabaseEnv();
  const serviceEnvReady = hasServiceRoleSupabaseEnv();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      {!publicEnvReady || !serviceEnvReady ? (
        <div className="border-b border-line bg-accent/10">
          <div className="mx-auto max-w-7xl px-4 py-3 text-sm text-foreground sm:px-6 lg:px-8">
            Mode demo aktif. Isi `.env.local` dan jalankan `supabase/schema.sql`
            di Supabase SQL Editor untuk workflow live.
          </div>
        </div>
      ) : null}
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
