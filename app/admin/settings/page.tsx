import { StoreSettingsPanel } from "@/components/admin/store-settings-panel";
import { Badge } from "@/components/ui/badge";
import { getAdminStoreSettings } from "@/lib/data";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { getFirstValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const query = await searchParams;
  const settings = await getAdminStoreSettings();
  const liveMode = hasServiceRoleSupabaseEnv();
  const notice = getFirstValue(query.notice);
  const toneValue = getFirstValue(query.tone);
  const noticeTone =
    toneValue === "success" || toneValue === "danger" || toneValue === "accent"
      ? toneValue
      : undefined;

  return (
    <div className="space-y-8">
      <section>
        <Badge tone={liveMode ? "brand" : "accent"}>
          {liveMode ? "Live Admin Settings" : "Mock Admin Settings"}
        </Badge>
        <h2 className="mt-3 text-4xl font-black">Pengaturan Website & Pembayaran</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Halaman ini dipisah jadi beberapa section supaya edit brand, homepage,
          checkout QRIS, dan refund lebih cepat dicari.
        </p>
      </section>

      <StoreSettingsPanel
        settings={settings}
        liveMode={liveMode}
        notice={notice}
        noticeTone={noticeTone}
      />
    </div>
  );
}
