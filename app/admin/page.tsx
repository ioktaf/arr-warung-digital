import Link from "next/link";
import { BellRing, CircleDashed, CreditCard, PackageCheck } from "lucide-react";

import { AdminAutoRefresh } from "@/components/admin/admin-auto-refresh";
import { OrderFilterForm } from "@/components/admin/order-filter-form";
import { OrderBoard } from "@/components/admin/order-board";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminOrders } from "@/lib/data";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { getFirstValue, normalizeWhatsappNumber } from "@/lib/utils";

type AdminOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const orders = await getAdminOrders();
  const query = await searchParams;
  const liveMode = hasServiceRoleSupabaseEnv();
  const searchValue = getFirstValue(query.q) ?? "";
  const statusFilter = getFirstValue(query.status) ?? "";
  const proofFilter = getFirstValue(query.proof) ?? "";
  const promoFilter = getFirstValue(query.promo) ?? "";
  const normalizedSearch = searchValue.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesProof =
      !proofFilter ||
      (proofFilter === "with" ? Boolean(order.proofImgUrl) : !order.proofImgUrl);
    const matchesPromo =
      !promoFilter ||
      (promoFilter === "with" ? Boolean(order.promoCode) : !order.promoCode);
    const searchable = [
      order.id,
      order.id.slice(0, 8),
      order.buyerName,
      order.buyerWa,
      normalizeWhatsappNumber(order.buyerWa),
      order.promoCode ?? "",
      ...order.items.map((item) => item.product.title),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 || searchable.includes(normalizedSearch);

    return matchesStatus && matchesProof && matchesPromo && matchesSearch;
  });

  const pendingCount = filteredOrders.filter((order) => order.status === "pending").length;
  const awaitingCount = filteredOrders.filter(
    (order) => order.status === "awaiting_verification",
  ).length;
  const paidCount = filteredOrders.filter((order) => order.status === "paid").length;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone={liveMode ? "brand" : "accent"}>
            {liveMode ? "Live Admin" : "Mock Admin"}
          </Badge>
          <h2 className="mt-3 text-4xl font-black">Order Verification Board</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Fokus utama admin ada di order `Awaiting Verification`. Dari sana,
            alur berikutnya sederhana: cek mutasi, approve, kirim akun lewat
            WhatsApp, lalu tutup order.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white"
          >
            Kelola Produk
          </Link>
          <Link
            href="/admin/promos"
            className="inline-flex items-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white"
          >
            Kelola Promo
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            Atur Store & Pembayaran
          </Link>
          <Link
            href="/admin/system"
            className="inline-flex items-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white"
          >
            Cek System Health
          </Link>
        </div>
      </section>

      <AdminAutoRefresh />

      <OrderFilterForm
        query={searchValue}
        status={statusFilter}
        proof={proofFilter}
        promo={promoFilter}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <CircleDashed className="h-5 w-5 text-muted" />
            <Badge>{pendingCount} order</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Pending
          </p>
          <p className="mt-2 text-3xl font-black">{pendingCount}</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Buyer baru submit data checkout, belum konfirmasi bayar.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <BellRing className="h-5 w-5 text-accent" />
            <Badge tone="accent">{awaitingCount} urgent</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Awaiting Verification
          </p>
          <p className="mt-2 text-3xl font-black">{awaitingCount}</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Ini prioritas utama untuk dicek ke mutasi bank atau e-wallet.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <PackageCheck className="h-5 w-5 text-success" />
            <Badge tone="brand">{paidCount} siap kirim</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Paid
          </p>
          <p className="mt-2 text-3xl font-black">{paidCount}</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Pembayaran cocok. Tinggal kirim akun ke buyer.
          </p>
        </Card>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-7 text-muted">
          Menampilkan <span className="font-semibold text-foreground">{filteredOrders.length}</span>
          {" "}dari {orders.length} order.
        </p>
        {(searchValue || statusFilter || proofFilter || promoFilter) ? (
          <Badge tone="brand">Filter aktif</Badge>
        ) : null}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <OrderBoard orders={filteredOrders} />
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Operator Checklist</h3>
                <p className="text-sm leading-7 text-muted">
                  Checklist ini ngikut workflow semi-auto yang kamu pilih.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-7 text-muted">
              <p>1. Buka order dengan status Awaiting Verification.</p>
              <p>2. Cek mutasi dari total transfer, kode unik, catatan buyer, dan bukti bayar.</p>
              <p>3. Setelah cocok, ubah ke Paid lalu kirim akun via WhatsApp.</p>
              <p>4. Tutup order ke Completed setelah buyer menerima akses.</p>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-2xl font-bold">Monitoring Ringkas</h3>
            <div className="space-y-3 text-sm leading-7 text-muted">
              <p>Gunakan filter untuk memisahkan order yang butuh cek bukti bayar, pakai promo, atau buyer tertentu.</p>
              <p>Menu `System` sekarang dipakai untuk cek schema version, bucket storage, env notifikasi, audit log, dan download backup.</p>
              <p>Notifikasi Telegram bisa hidup otomatis saat order baru masuk, buyer konfirmasi bayar, atau status order berubah.</p>
              <p>Kalau hasil filter kosong, reset filter dulu supaya tidak terjebak melihat subset order saja.</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
