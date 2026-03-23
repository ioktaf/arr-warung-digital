import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShoppingBag,
  Upload,
  WalletCards,
} from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { parseCartItemsPayload, serializeCartItemsPayload } from "@/lib/cart";
import { getCheckoutOrder, getProductsByIds, getStoreSettings } from "@/lib/data";
import {
  formatCurrency,
  formatDateTime,
  formatUniqueCode,
  getOrderStatusMeta,
} from "@/lib/format";
import { clampCheckoutQuantity } from "@/lib/order-checkout";
import { getQrisImageDataUrl } from "@/lib/payment";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import {
  formatWhatsappDisplay,
  getFirstValue,
  normalizeWhatsappNumber,
} from "@/lib/utils";
import type { OrderStatus, Product } from "@/types/domain";

import { beginCartCheckoutAction, confirmCartPaymentAction } from "./actions";

type CartCheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CartCheckoutLine = {
  product: Product;
  quantity: number;
  subtotalPrice: number;
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

function getDraftCartLines(products: Product[], cartPayload: string) {
  const cartLines = parseCartItemsPayload(cartPayload);
  const productMap = new Map(products.map((product) => [product.id, product]));

  return cartLines.flatMap((line) => {
    const product = productMap.get(line.productId);

    if (!product) {
      return [];
    }

    const quantity = clampCheckoutQuantity(line.quantity, product.stock);

    return [
      {
        product,
        quantity,
        subtotalPrice: product.price * quantity,
      },
    ];
  });
}

export default async function CartCheckoutPage({
  searchParams,
}: CartCheckoutPageProps) {
  const query = await searchParams;
  const settings = await getStoreSettings();
  const orderId = getFirstValue(query.order);
  const order = orderId ? await getCheckoutOrder(orderId) : null;
  const cartPayloadFromQuery = getFirstValue(query.cart) ?? "";
  const uniqueCodeFromQuery = Number.parseInt(
    getFirstValue(query.uniqueCode) ?? "0",
    10,
  );
  const buyerName = order?.buyerName ?? getFirstValue(query.buyerName) ?? "";
  const rawBuyerWa = order?.buyerWa ?? getFirstValue(query.buyerWa) ?? "";
  const normalizedBuyerWa = normalizeWhatsappNumber(rawBuyerWa);
  const buyerWaInputValue = normalizedBuyerWa ? `+${normalizedBuyerWa}` : "+62";
  const buyerWaDisplayValue = formatWhatsappDisplay(rawBuyerWa);
  const error = getFirstValue(query.error);
  const success = getFirstValue(query.success);
  const step = getFirstValue(query.step);
  const demoMode = getFirstValue(query.demo) === "1" || !hasServiceRoleSupabaseEnv();

  const draftProducts = await getProductsByIds(
    parseCartItemsPayload(cartPayloadFromQuery).map((item) => item.productId),
  );
  const draftLines = getDraftCartLines(draftProducts, cartPayloadFromQuery);

  if (!order && !draftLines.length) {
    redirect("/cart");
  }

  const displayLines: CartCheckoutLine[] = order
    ? order.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        subtotalPrice: item.subtotalPrice,
      }))
    : draftLines;
  const totalQuantity =
    order?.totalQuantity ??
    displayLines.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPrice =
    order?.subtotalPrice ??
    displayLines.reduce((sum, item) => sum + item.subtotalPrice, 0);
  const status: OrderStatus =
    order?.status ?? (step === "awaiting-verification" ? "awaiting_verification" : "pending");
  const statusMeta = getOrderStatusMeta(status);
  const buyerReady = Boolean(buyerName && normalizedBuyerWa);
  const progress = progressLabels[status];
  const uniqueCode =
    order?.uniqueCode ??
    (Number.isFinite(uniqueCodeFromQuery) && uniqueCodeFromQuery > 0
      ? uniqueCodeFromQuery
      : 0);
  const transferAmount = buyerReady
    ? order?.totalPrice ?? (subtotalPrice + uniqueCode)
    : subtotalPrice;
  const qrisImageDataUrl = await getQrisImageDataUrl(
    settings.paymentQrisPayload,
    buyerReady ? transferAmount : undefined,
  );
  const cartPayload =
    cartPayloadFromQuery ||
    serializeCartItemsPayload(
      displayLines.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke keranjang
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
                  Checkout Keranjang
                </p>
                <h1 className="mt-2 text-4xl font-black">Gabungkan beberapa produk sekaligus</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  Semua item di bawah akan masuk ke satu order, satu QRIS, dan satu
                  total transfer akhir yang sudah termasuk kode unik.
                </p>
              </div>
              <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-line bg-white/60 p-5 sm:grid-cols-4">
              <div>
                <p className="text-sm text-muted">Baris produk</p>
                <p className="mt-2 text-2xl font-black">{displayLines.length} item</p>
              </div>
              <div>
                <p className="text-sm text-muted">Total seat</p>
                <p className="mt-2 text-lg font-semibold">{totalQuantity} seat</p>
              </div>
              <div>
                <p className="text-sm text-muted">Subtotal</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(subtotalPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Status</p>
                <p className="mt-2 text-lg font-semibold">{statusMeta.label}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ringkasan Item Checkout</h2>
                <p className="text-sm leading-7 text-muted">
                  Jumlah seat per item tetap dihitung satu per satu sebelum
                  digabung ke total transfer.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {displayLines.map((item) => (
                <div
                  key={`${item.product.id}-${item.quantity}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-white/60 p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.product.title}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">
                      {item.quantity} seat x {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(item.subtotalPrice)}</p>
                </div>
              ))}
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
                action={beginCartCheckoutAction}
                className="grid gap-4"
              >
                <input
                  type="hidden"
                  name="cartPayload"
                  value={cartPayload}
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
                  <p className="text-sm text-muted">Total seat</p>
                  <p className="mt-2 font-semibold">{totalQuantity} seat</p>
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
                    <h2 className="text-2xl font-bold">{settings.paymentCheckoutTitle}</h2>
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
                        {formatCurrency(transferAmount)}
                      </p>
                      <div className="mt-3 space-y-2 text-sm leading-7 text-muted">
                        <p>Subtotal keranjang: {formatCurrency(subtotalPrice)}</p>
                        <p>Total seat: {totalQuantity} seat</p>
                        <p>Kode unik: {uniqueCode > 0 ? formatUniqueCode(uniqueCode) : "-"}</p>
                        <p>
                          QRIS merchant tetap satu, tapi nominal QR mengikuti total
                          gabungan seluruh item di atas.
                        </p>
                      </div>
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
                  action={confirmCartPaymentAction}
                  className="grid gap-4"
                >
                  <input
                    type="hidden"
                    name="cartPayload"
                    value={cartPayload}
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
                  <input
                    type="hidden"
                    name="uniqueCode"
                    value={uniqueCode > 0 ? String(uniqueCode) : ""}
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
                            ? "Buyer tinggal scan QRIS dan transfer total keranjang."
                            : index === 2
                              ? "Admin cocokkan mutasi dengan total transfer dan kode unik."
                              : "Status akhir setelah seluruh akses berhasil dikirim."}
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
                  <p className="text-sm text-muted">Subtotal Keranjang</p>
                  <p className="mt-1 font-semibold">{formatCurrency(order.subtotalPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Total Seat</p>
                  <p className="mt-1 font-semibold">{order.totalQuantity} seat</p>
                </div>
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
                  <p className="text-sm text-muted">Order Ref</p>
                  <p className="mt-1 font-semibold">#{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Created At</p>
                  <p className="mt-1 font-semibold">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
