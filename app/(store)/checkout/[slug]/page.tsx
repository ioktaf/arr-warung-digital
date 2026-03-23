import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Upload,
  WalletCards,
} from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCheckoutOrder, getProductBySlug, getStoreSettings } from "@/lib/data";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusMeta,
} from "@/lib/format";
import { getQrisImageDataUrl } from "@/lib/payment";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import {
  formatWhatsappDisplay,
  getFirstValue,
  normalizeWhatsappNumber,
} from "@/lib/utils";
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
  const settings = await getStoreSettings();
  const qrisImageDataUrl = await getQrisImageDataUrl(
    settings.paymentQrisPayload,
  );

  if (!product) {
    notFound();
  }

  const orderId = getFirstValue(query.order);
  const order = orderId ? await getCheckoutOrder(orderId) : null;
  const buyerName = order?.buyerName ?? getFirstValue(query.buyerName) ?? "";
  const rawBuyerWa = order?.buyerWa ?? getFirstValue(query.buyerWa) ?? "";
  const normalizedBuyerWa = normalizeWhatsappNumber(rawBuyerWa);
  const buyerWaInputValue = normalizedBuyerWa ? `+${normalizedBuyerWa}` : "+62";
  const buyerWaDisplayValue = formatWhatsappDisplay(rawBuyerWa);
  const error = getFirstValue(query.error);
  const success = getFirstValue(query.success);
  const step = getFirstValue(query.step);
  const demoMode = getFirstValue(query.demo) === "1" || !hasServiceRoleSupabaseEnv();

  const status: OrderStatus =
    order?.status ?? (step === "awaiting-verification" ? "awaiting_verification" : "pending");
  const statusMeta = getOrderStatusMeta(status);
  const buyerReady = Boolean(buyerName && normalizedBuyerWa);
  const progress = progressLabels[status];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke katalog
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
                  {settings.checkoutEyebrow}
                </p>
                <h1 className="mt-2 text-4xl font-black">{product.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  {settings.checkoutIntroDescription}
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
              {settings.paymentSuccessMessage}
            </div>
          ) : null}

          {!buyerReady ? (
            <Card className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{settings.buyerFormTitle}</h2>
                  <p className="text-sm leading-7 text-muted">
                    {settings.buyerFormDescription}
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
                    placeholder="+628xxxxxxxxxx"
                    defaultValue={buyerWaInputValue}
                    className="rounded-2xl border border-line bg-white/70 px-4 py-3 outline-none transition focus:border-brand"
                  />
                </label>
                <SubmitButton
                  idleLabel={settings.checkoutContinueButtonLabel}
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
                  <h2 className="text-2xl font-bold">{settings.buyerReadyTitle}</h2>
                  <p className="text-sm leading-7 text-muted">
                    {settings.buyerReadyDescription}
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
                  <p className="mt-2 font-semibold">{buyerWaDisplayValue}</p>
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
                    <h2 className="text-2xl font-bold">
                      {settings.paymentCheckoutTitle}
                    </h2>
                    <p className="text-sm leading-7 text-muted">
                      {settings.paymentCheckoutDescription}
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[28px] border border-line bg-white/75 p-4">
                    {qrisImageDataUrl ? (
                      <Image
                        src={qrisImageDataUrl}
                        alt={settings.paymentDisplayLabel}
                        width={960}
                        height={960}
                        unoptimized
                        className="w-full rounded-[22px]"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-[22px] border border-dashed border-line bg-white px-6 text-center text-sm leading-7 text-muted">
                        QRIS gagal digenerate. Cek konfigurasi payload merchant di server.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-line bg-white/60 p-5">
                      <p className="text-sm uppercase tracking-[0.22em] text-muted">
                        Merchant QRIS
                      </p>
                      <p className="mt-2 text-2xl font-black">
                        {settings.paymentMerchantName}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        {settings.paymentDisplayLabel} - {settings.paymentMerchantCity}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-line bg-white/60 p-5">
                      <p className="text-sm uppercase tracking-[0.22em] text-muted">
                        Nominal Transfer
                      </p>
                      <p className="mt-2 text-3xl font-black">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        QRIS ini tetap statis di merchant {settings.paymentMerchantName}.
                        Buyer cukup scan QR, lalu transfer sesuai nominal produk
                        yang tampil di halaman ini.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-line bg-white/60 p-5">
                      <p className="text-sm uppercase tracking-[0.22em] text-muted">
                        Instruksi Ringkas
                      </p>
                      <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
                        {settings.paymentInstructionLines.map((line, index) => (
                          <p key={`${index + 1}-${line}`}>
                            {index + 1}. {line}
                          </p>
                        ))}
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
                    <h2 className="text-2xl font-bold">{settings.paymentConfirmTitle}</h2>
                    <p className="text-sm leading-7 text-muted">
                      {settings.paymentConfirmDescription}
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
                    value={buyerWaDisplayValue}
                  />

                  <label className="grid gap-2 text-sm font-medium">
                    {settings.paymentNoteLabel}
                    <textarea
                      name="paymentNote"
                      rows={4}
                      placeholder="Contoh: transfer dari BCA a.n. Budi jam 19:12"
                      defaultValue={order?.paymentNote ?? ""}
                      className="rounded-[24px] border border-line bg-white/70 px-4 py-3 outline-none transition focus:border-brand"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    {settings.proofUploadLabel}
                    <input
                      type="file"
                      name="proofFile"
                      accept="image/png,image/jpeg,image/webp"
                      className="rounded-[24px] border border-dashed border-line bg-white/70 px-4 py-3 text-sm"
                    />
                  </label>

                  <SubmitButton
                    idleLabel={settings.paymentConfirmButtonLabel}
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
              <h2 className="text-2xl font-bold">{settings.trackerTitle}</h2>
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
                <h2 className="text-2xl font-bold">{settings.operationalNotesTitle}</h2>
                <p className="text-sm leading-7 text-muted">
                  {settings.operationalNotesDescription}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-7 text-muted">
              {settings.operationalNotesLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Card>

          {order ? (
            <Card className="space-y-4">
              <h2 className="text-2xl font-bold">{settings.orderSnapshotTitle}</h2>
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
