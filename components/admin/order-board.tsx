import Link from "next/link";
import { ExternalLink, MessageCircleMore } from "lucide-react";

import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  formatCurrency,
  formatDateTime,
  formatUniqueCode,
  getOrderStatusMeta,
} from "@/lib/format";
import { formatWhatsappDisplay, formatWhatsappHref } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/domain";

const nextActionByStatus: Record<OrderStatus, string> = {
  pending: "Tunggu buyer klik Konfirmasi Sudah Bayar.",
  awaiting_verification: "Cek mutasi bank atau e-wallet sekarang.",
  paid: "Kirim akun via WhatsApp lalu update ke Completed.",
  completed: "Arsipkan bukti jika perlu dan fokus ke order berikutnya.",
  cancelled: "Tandai alasan cancel untuk kebutuhan audit.",
};

type OrderBoardProps = {
  orders: Order[];
};

export function OrderBoard({ orders }: OrderBoardProps) {
  if (!orders.length) {
    return (
      <Card>
        <p className="text-lg font-semibold">Belum ada order masuk.</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          Setelah buyer submit checkout atau konfirmasi pembayaran, daftar order
          akan muncul di sini.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusMeta = getOrderStatusMeta(order.status);
        const basePrice = order.subtotalPrice;
        const orderTitle =
          order.items.length > 1
            ? `Keranjang ${order.items.length} item`
            : order.totalQuantity > 1
              ? `${order.product.title} (${order.totalQuantity} seat)`
              : order.product.title;

        return (
          <Card
            key={order.id}
            className="space-y-5"
          >
            <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Order #{order.id.slice(0, 8)}
                </p>
                <h3 className="text-2xl font-bold">{orderTitle}</h3>
                <p className="text-sm leading-7 text-muted">
                  Buyer {order.buyerName} - {formatWhatsappDisplay(order.buyerWa)}
                </p>
                {order.uniqueCode > 0 ? (
                  <p className="text-sm leading-7 text-muted">
                    Subtotal {formatCurrency(basePrice)} + kode unik{" "}
                    {formatUniqueCode(order.uniqueCode)}
                  </p>
                ) : null}
                {order.promoCode && order.promoDiscountAmount > 0 ? (
                  <p className="text-sm leading-7 text-muted">
                    Promo {order.promoCode} -{formatCurrency(order.promoDiscountAmount)}
                  </p>
                ) : null}
                {order.items.length ? (
                  <div className="space-y-1 text-sm leading-7 text-muted">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.quantity}x {item.product.title}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                <div className="text-right text-sm text-muted">
                  <p>{formatCurrency(order.totalPrice)}</p>
                  {order.uniqueCode > 0 ? (
                    <p className="mt-1 text-xs">Kode {formatUniqueCode(order.uniqueCode)}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Dibuat</p>
                <p className="mt-1 text-sm leading-7 text-muted">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Konfirmasi Buyer
                </p>
                <p className="mt-1 text-sm leading-7 text-muted">
                  {formatDateTime(order.paymentConfirmedAt)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Total Seat</p>
                <p className="mt-1 text-sm leading-7 text-muted">
                  {order.totalQuantity} seat
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Catatan Pembayaran
                </p>
                <p className="mt-1 text-sm leading-7 text-muted">
                  {order.paymentNote ?? "Belum ada catatan dari buyer."}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Promo</p>
                <p className="mt-1 text-sm leading-7 text-muted">
                  {order.promoCode && order.promoDiscountAmount > 0
                    ? `${order.promoCode} (-${formatCurrency(order.promoDiscountAmount)})`
                    : "Tanpa promo"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Next Action
                </p>
                <p className="mt-1 text-sm leading-7 text-muted">
                  {nextActionByStatus[order.status]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={formatWhatsappHref(order.buyerWa)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white"
              >
                <MessageCircleMore className="h-4 w-4" />
                Hubungi Buyer
              </Link>

              {order.proofImgUrl ? (
                <Link
                  href={order.proofImgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Lihat Bukti Bayar
                </Link>
              ) : null}
            </div>

            <div className="border-t border-line pt-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Quick Actions
              </p>
              <div className="mt-3">
                <OrderStatusActions order={order} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
