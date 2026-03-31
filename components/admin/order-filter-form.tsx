import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type OrderFilterFormProps = {
  query: string;
  status: string;
  proof: string;
  promo: string;
};

export function OrderFilterForm({
  query,
  status,
  proof,
  promo,
}: OrderFilterFormProps) {
  const hasActiveFilter = Boolean(query || status || proof || promo);

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge tone="accent">Filter Order</Badge>
          <h3 className="mt-3 text-2xl font-black">Cari order lebih cepat</h3>
        </div>
        {hasActiveFilter ? (
          <Link
            href="/admin"
            className="inline-flex items-center rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white"
          >
            Reset filter
          </Link>
        ) : null}
      </div>

      <form
        method="get"
        className="grid gap-4 lg:grid-cols-[1.8fr_1fr_1fr_1fr_auto]"
      >
        <label className="grid gap-2 text-sm font-medium">
          Cari order
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Ref order, buyer, WhatsApp, promo, produk"
              className="w-full rounded-2xl border border-line bg-white/75 py-3 pl-11 pr-4 outline-none transition focus:border-brand"
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={status}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
          >
            <option value="">Semua</option>
            <option value="pending">Pending</option>
            <option value="awaiting_verification">Awaiting Verification</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Bukti bayar
          <select
            name="proof"
            defaultValue={proof}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
          >
            <option value="">Semua</option>
            <option value="with">Ada bukti</option>
            <option value="without">Belum upload</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Promo
          <select
            name="promo"
            defaultValue={promo}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
          >
            <option value="">Semua</option>
            <option value="with">Pakai promo</option>
            <option value="without">Tanpa promo</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Terapkan
          </button>
        </div>
      </form>
    </Card>
  );
}
