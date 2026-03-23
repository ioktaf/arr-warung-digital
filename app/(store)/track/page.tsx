import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTrackableOrder } from "@/lib/data";
import {
  formatCurrency,
  formatDateTime,
  formatUniqueCode,
  getOrderStatusMeta,
} from "@/lib/format";
import { getFirstValue, normalizeWhatsappNumber } from "@/lib/utils";

type TrackOrderPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrackOrderPage({
  searchParams,
}: TrackOrderPageProps) {
  const query = await searchParams;
  const reference = getFirstValue(query.ref) ?? "";
  const rawBuyerWa = getFirstValue(query.wa) ?? "";
  const buyerWa = normalizeWhatsappNumber(rawBuyerWa);
  const searched = Boolean(reference || rawBuyerWa);
  const order = searched
    ? await getTrackableOrder(reference, rawBuyerWa)
    : null;
  const statusMeta = order ? getOrderStatusMeta(order.status) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke katalog
        </Link>
        <Badge tone="brand">Lacak Order</Badge>
      </div>

      <section className="space-y-6">
        <Card className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand/10 p-3 text-brand">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Lacak status pesananmu</h1>
              <p className="mt-2 text-sm leading-7 text-muted">
                Masukkan order ref dan nomor WhatsApp yang kamu pakai saat checkout.
              </p>
            </div>
          </div>

          <form
            method="get"
            className="grid gap-4 sm:grid-cols-2"
          >
            <label className="grid gap-2 text-sm font-medium">
              Order Ref
              <input
                name="ref"
                defaultValue={reference}
                placeholder="Contoh: 5EB4C03C"
                className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Nomor WhatsApp
              <input
                name="wa"
                defaultValue={buyerWa ? `+${buyerWa}` : ""}
                placeholder="+628xxxxxxxxxx"
                className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                Cek Status Order
              </button>
            </div>
          </form>
        </Card>

        {searched && !order ? (
          <Card>
            <p className="text-lg font-semibold">Order tidak ditemukan.</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              Pastikan order ref dan WhatsApp sama persis dengan data saat checkout.
            </p>
          </Card>
        ) : null}

        {order && statusMeta ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Order Ref
                  </p>
                  <h2 className="mt-2 text-2xl font-black">#{order.id.slice(0, 8)}</h2>
                </div>
                <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-line bg-white/60 p-4"
                  >
                    <p className="font-semibold text-foreground">{item.product.title}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">
                      {item.quantity} seat x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-success/10 p-3 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Ringkasan Status</h2>
                  <p className="text-sm leading-7 text-muted">
                    {statusMeta.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 rounded-[24px] border border-line bg-white/60 p-5">
                <div>
                  <p className="text-sm text-muted">Total Transfer</p>
                  <p className="mt-1 font-semibold">{formatCurrency(order.totalPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Kode Unik</p>
                  <p className="mt-1 font-semibold">
                    {order.uniqueCode > 0 ? formatUniqueCode(order.uniqueCode) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted">Total Seat</p>
                  <p className="mt-1 font-semibold">{order.totalQuantity} seat</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Dibuat</p>
                  <p className="mt-1 font-semibold">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>

              <p className="text-sm leading-7 text-muted">
                Simpan halaman ini untuk memantau progres ordermu. Jika butuh bantuan,
                hubungi admin lewat WhatsApp.
              </p>
            </Card>
          </div>
        ) : null}

        <Card>
          <p className="text-lg font-semibold">Tips singkat</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-muted">
            <p>1. Gunakan WhatsApp yang sama dengan data checkout.</p>
            <p>2. Order ref bisa dilihat di halaman checkout setelah order dibuat.</p>
            <p>3. Kalau pembayaran baru dikirim, tunggu admin verifikasi dulu.</p>
          </div>
          <div className="mt-4">
            <Link
              href="/#produk"
              className="inline-flex items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white"
            >
              Kembali Belanja
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
