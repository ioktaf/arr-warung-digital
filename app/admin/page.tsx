import Link from "next/link";
import { BellRing, CircleDashed, CreditCard, PackageCheck } from "lucide-react";

import { AdminAutoRefresh } from "@/components/admin/admin-auto-refresh";
import { OrderBoard } from "@/components/admin/order-board";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminOrders } from "@/lib/data";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  const liveMode = hasServiceRoleSupabaseEnv();

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const awaitingCount = orders.filter(
    (order) => order.status === "awaiting_verification",
  ).length;
  const paidCount = orders.filter((order) => order.status === "paid").length;

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
        </div>
      </section>

      <AdminAutoRefresh />

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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <OrderBoard orders={orders} />
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
            <h3 className="text-2xl font-bold">Catatan Setup</h3>
            <div className="space-y-3 text-sm leading-7 text-muted">
              <p>Dashboard ini baca data live kalau `SUPABASE_SERVICE_ROLE_KEY` sudah diisi.</p>
              <p>Bucket `payment-proofs` dipakai buat upload bukti bayar dari halaman checkout.</p>
              <p>Panel `/admin/settings` sekarang mengendalikan copy storefront, QRIS, dan refund calculator operasional.</p>
              <p>Realtime channel untuk `orders` sudah disiapkan di schema SQL, tinggal dipakai di sprint berikutnya untuk notif toast atau badge live.</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
