import { TicketPercent } from "lucide-react";

import { PromoCodeTable } from "@/components/admin/promo-code-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminPromoCodes } from "@/lib/promo-codes";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { getFirstValue } from "@/lib/utils";

type AdminPromosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPromosPage({
  searchParams,
}: AdminPromosPageProps) {
  const promos = await getAdminPromoCodes();
  const liveMode = hasServiceRoleSupabaseEnv();
  const query = await searchParams;
  const notice = getFirstValue(query.notice);
  const toneValue = getFirstValue(query.tone);
  const noticeTone =
    toneValue === "success" || toneValue === "danger" || toneValue === "accent"
      ? toneValue
      : undefined;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone={liveMode ? "brand" : "accent"}>
            {liveMode ? "Live Promo" : "Mock Promo"}
          </Badge>
          <h2 className="mt-3 text-4xl font-black">Promo Codes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Atur kode promo dari dashboard. Buyer tetap melihat checkout yang
            simpel karena input promo disembunyikan di dropdown opsional.
          </p>
        </div>

        <Card className="flex items-center gap-3 px-5 py-4">
          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
            <TicketPercent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted">Promo aktif</p>
            <p className="text-2xl font-black">
              {promos.filter((promo) => promo.isActive).length}
            </p>
          </div>
        </Card>
      </section>

      <PromoCodeTable
        promos={promos}
        notice={notice}
        noticeTone={noticeTone}
      />
    </div>
  );
}
