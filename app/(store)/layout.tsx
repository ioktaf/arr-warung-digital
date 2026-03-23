import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  hasPublicSupabaseEnv,
  hasServiceRoleSupabaseEnv,
} from "@/lib/supabase/env";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicEnvReady = hasPublicSupabaseEnv();
  const serviceEnvReady = hasServiceRoleSupabaseEnv();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {!publicEnvReady || !serviceEnvReady ? (
        <div className="border-b border-line bg-accent/10">
          <div className="mx-auto max-w-7xl px-4 py-3 text-sm text-foreground sm:px-6 lg:px-8">
            Mode demo aktif. Isi `.env.local` dan jalankan `supabase/schema.sql`
            di Supabase SQL Editor untuk workflow live.
          </div>
        </div>
      ) : null}
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
