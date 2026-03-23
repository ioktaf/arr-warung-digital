import { CreditCard, LayoutTemplate, ShieldCheck } from "lucide-react";

import { StoreSettingsPanel } from "@/components/admin/store-settings-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
        <h2 className="mt-3 text-4xl font-black">Control Center Jualan & Pembayaran</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Sekarang admin bisa mengatur hampir seluruh isi storefront, panel
          checkout QRIS, dan tool operasional refund langsung dari website tanpa
          edit file satu per satu.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <LayoutTemplate className="h-5 w-5 text-brand" />
            <Badge>{settings.brandLogoUrl ? "Logo aktif" : "Tanpa logo"}</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Storefront
          </p>
          <p className="mt-2 text-3xl font-black">Editable</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Hero, CTA, workflow, katalog, stack, dan dashboard notes kini
            terhubung ke panel admin settings.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CreditCard className="h-5 w-5 text-accent" />
            <Badge tone="accent">{settings.paymentMerchantName}</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Pembayaran
          </p>
          <p className="mt-2 text-3xl font-black">QRIS Live</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Payload QRIS, merchant label, deskripsi checkout, dan instruksi
            buyer bisa diganti langsung dari sini.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <ShieldCheck className="h-5 w-5 text-success" />
            <Badge tone="success">Protected</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Operasional
          </p>
          <p className="mt-2 text-3xl font-black">Refund Ready</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Kalkulator refund tersedia untuk bantu hitung prorata saat ada
            kendala akun atau sisa masa pakai langganan.
          </p>
        </Card>
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
