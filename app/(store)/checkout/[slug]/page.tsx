import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Upload,
  WalletCards,
} from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCheckoutOrder, getProductBySlug } from "@/lib/data";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusMeta,
} from "@/lib/format";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { getFirstValue } from "@/lib/utils";
import type { OrderStatus } from "@/types/domain";

import { beginCheckoutAction, confirmPaymentAction } from "./actions";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const progressLabels: Record<OrderStatus, string[]> = {
  pending: [
    "Data buyer masuk",
    "Buyer transfer QRIS",
    "Admin menunggu konfirmasi bayar",
    "Produk dikirim",
  ],
  awaiting_verification: [
    "Data buyer masuk",
    "Buyer transfer QRIS",
    "Admin cek mutasi",
    "Produk menunggu dikirim",
  ],
  paid: [
    "Data buyer masuk",
    "Pembayaran terverifikasi",
    "Admin siap kirim akun",
    "Order hampir selesai",
  ],
  completed: [
    "Data buyer masuk",
    "Pembayaran terverifikasi",
    "Akun terkirim",
    "Order selesai",
  ],
  cancelled: [
    "Data buyer masuk",
    "Order ditutup",
    "Tidak ada proses lanjutan",
    "Order selesai",
  ],
};

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const orderId = getFirstValue(query.order);
  const order = orderId ? await getCheckoutOrder(orderId) : null;
  const buyerName = order?.buyerName ?? getFirstValue(query.buyerName) ?? "";
  const buyerWa = order?.buyerWa ?? getFirstValue(query.buyerWa) ?? "";
  const error = getFirstValue(query.error);
  const success = getFirstValue(query.success);
  const step = getFirstValue(query.step);
  const demoMode = getFirstValue(query.demo) === "1" || !hasServiceRoleSupabaseEnv();

  const status: OrderStatus =
    order?.status ?? (step === "awaiting-verification" ? "awaiting_verification" : "pending");
  const statusMeta = getOrderStatusMeta(status);
  const buyerReady = Boolean(buyerName && buyerWa);
  const progress = progressLabels[status];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-muted transition hover:text-foreground"
        >
          ← Kembali ke katalog
        </Link>
        <Badge tone={demoMode ? "accent" : "brand"}>
          {demoMode ? "Demo Checkout" : "Live Checkout"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Checkout Produk
                </p>
                <h1 className="mt-2 text-4xl font-black">{product.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  Buyer cukup isi nama dan WhatsApp dulu. Setelah itu sistem
                  arahkan ke QRIS dan tombol konfirmasi pembayaran.
                </p>
              </div>
              <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-line bg-white/60 p-5 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted">Harga</p>
                <p className="mt-2 text-2xl font-black">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Kategori</p>
                <p className="mt-2 text-lg font-semibold">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Stok</p>
                <p className="mt-2 text-lg font-semibold">{product.stock} slot</p>
              </div>
            </div>
          </Card>

          {error ? (
            <div className="rounded-[24px] border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-[24px] border border-success/20 bg-success/10 px-5 py-4 text-sm text-success">
              Konfirmasi pembayaran sudah dikirim. Admin tinggal cek mutasi lalu
              update status order di dashboard.
            </div>
          ) : null}

          {!buyerReady ? (
            <Card className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">1. Isi Data Buyer</h2>
                  <p className="text-sm leading-7 text-muted">
                    Data ini dipakai admin untuk cocokin pembayaran dan kirim
                    akun lewat WhatsApp.
                  </p>
                </div>
              </div>

              <form
                action={beginCheckoutAction}
                className="grid gap-4"
              >
                <input
                  type="hidden"
                  name="slug"
                  value={product.slug}
                />
                <label className="grid gap-2 text-sm font-medium">
                  Nama Buyer
                  <input
                    name="buyerName"
                    placeholder="Contoh: Budi"
                    defaultValue={buyerName}
                    className="rounded-2xl border border-line bg-white/70 px-4 py-3 outline-none transition focus:border-brand"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  WhatsApp
                  <input
                    name="buyerWa"
                    placeholder="08xxxxxxxxxx"
                    defaultValue={buyerWa}
                    className="rounded-2xl border border-line bg-white/70 px-4 py-3 outline-none transition focus:border-brand"
                  />
                </label>
                <SubmitButton
                  idleLabel="Lanjut ke Pembayaran"
                  pendingLabel="Membuat Order..."
                  className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
                />
              </form>
            </Card>
          ) : (
            <Card className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-success/10 p-3 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Data Buyer Tersimpan</h2>
                  <p className="text-sm leading-7 text-muted">
                    Order siap lanjut ke tahap pembayaran QRIS.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 rounded-[24px] border border-line bg-white/60 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted">Nama Buyer</p>
                  <p className="mt-2 font-semibold">{buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">WhatsApp</p>
                  <p className="mt-2 font-semibold">{buyerWa}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Order Ref</p>
                  <p className="mt-2 font-semibold">
                    {orderId ? `#${orderId.slice(0, 8)}` : "Demo Preview"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted">Dibuat</p>
                  <p className="mt-2 font-semibold">
                    {order ? formatDateTime(order.createdAt) : "Baru saja"}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {buyerReady ? (
            <>
              <Card className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">2. Transfer via QRIS</h2>
                    <p className="text-sm leading-7 text-muted">
                      Pakai QRIS statis merchant dulu. Setelah transfer, buyer
                      klik konfirmasi pembayaran di bawah.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[28px] border border-line bg-white/75 p-4">
                    <Image
                      src="/qris-placeholder.svg"
                      alt="Placeholder QRIS merchant"
                      width={640}
                      height={640}
                      className="w-full rounded-[22px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-line bg-white/60 p-5">
                      <p className="text-sm uppercase tracking-[0.22em] text-muted">
                        Nominal Transfer
                      </p>
                      <p className="mt-2 text-3xl font-black">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        Kalau nanti pakai QRIS dinamis, angka ini bisa digenerate
                        otomatis per order. Untuk MVP, nominal cukup ditampilkan
                        jelas di halaman ini.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-line bg-white/60 p-5">
                      <p className="text-sm uppercase tracking-[0.22em] text-muted">
                        Instruksi Ringkas
                      </p>
                      <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
                        <p>1. Scan QRIS merchant atau transfer nominal yang tampil.</p>
                        <p>2. Kembali ke halaman ini lalu klik konfirmasi bayar.</p>
                        <p>3. Upload bukti transfer kalau ada biar admin lebih cepat cek.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      3. Konfirmasi Sudah Bayar
                    </h2>
                    <p className="text-sm leading-7 text-muted">
                      Begitu form ini dikirim, order masuk ke status
                      Awaiting Verification di dashboard admin.
                    </p>
                  </div>
                </div>

                <form
                  action={confirmPaymentAction}
                  className="grid gap-4"
                >
                  <input
                    type="hidden"
                    name="slug"
                    value={product.slug}
                  />
                  <input
                    type="hidden"
                    name="orderId"
                    value={orderId ?? ""}
                  />
                  <input
                    type="hidden"
                    name="buyerName"
                    value={buyerName}
                  />
                  <input
                    type="hidden"
                    name="buyerWa"
                    value={buyerWa}
                  />

                  <label className="grid gap-2 text-sm font-medium">
                    Catatan Pembayaran
                    <textarea
                      name="paymentNote"
                      rows={4}
                      placeholder="Contoh: transfer dari BCA a.n. Budi jam 19:12"
                      defaultValue={order?.paymentNote ?? ""}
                      className="rounded-[24px] border border-line bg-white/70 px-4 py-3 outline-none transition focus:border-brand"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Upload Bukti Bayar
                    <input
                      type="file"
                      name="proofFile"
                      accept="image/png,image/jpeg,image/webp"
                      className="rounded-[24px] border border-dashed border-line bg-white/70 px-4 py-3 text-sm"
                    />
                  </label>

                  <SubmitButton
                    idleLabel="Konfirmasi Sudah Bayar"
                    pendingLabel="Mengirim Konfirmasi..."
                    className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c26f05] disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </form>
              </Card>
            </>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tracker Order</h2>
              <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
            </div>

            <div className="space-y-4">
              {progress.map((label, index) => {
                const activeIndex =
                  status === "pending"
                    ? 1
                    : status === "awaiting_verification"
                      ? 2
                      : 3;

                return (
                  <div
                    key={label}
                    className="flex gap-4"
                  >
                    <div
                      className={`mt-1 h-3.5 w-3.5 rounded-full ${
                        index <= activeIndex ? "bg-brand" : "bg-muted-soft"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-sm leading-7 text-muted">
                        {index === 0
                          ? "Nama dan WhatsApp buyer sudah tercatat."
                          : index === 1
                            ? "Buyer tinggal scan QRIS dan transfer nominal."
                            : index === 2
                              ? "Admin cocokkan mutasi dengan order ini."
                              : "Status akhir setelah akun berhasil dikirim."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-success/10 p-3 text-success">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Catatan Operasional</h2>
                <p className="text-sm leading-7 text-muted">
                  Halaman ini memang dibuat untuk workflow semi-auto.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-7 text-muted">
              <p>Admin tidak perlu mantengin mutasi tanpa konteks karena order masuk ke dashboard lebih dulu.</p>
              <p>Proof upload bersifat opsional, tapi sangat membantu saat nominal order mirip-mirip.</p>
              <p>Kalau nanti mau full-auto, struktur tabel order dan payment proof ini masih enak untuk ditingkatkan.</p>
            </div>
          </Card>

          {order ? (
            <Card className="space-y-4">
              <h2 className="text-2xl font-bold">Snapshot Order</h2>
              <div className="grid gap-4 rounded-[24px] border border-line bg-white/60 p-5">
                <div>
                  <p className="text-sm text-muted">Order Ref</p>
                  <p className="mt-1 font-semibold">#{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Created At</p>
                  <p className="mt-1 font-semibold">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted">Proof Image</p>
                  <p className="mt-1 font-semibold">
                    {order.proofImgUrl ? "Sudah ada" : "Belum upload"}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
