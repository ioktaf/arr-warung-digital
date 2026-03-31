import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { formatCurrency, formatUniqueCode } from "@/lib/format";
import { formatWhatsappHref, normalizeWhatsappNumber } from "@/lib/utils";

type PaymentBreakdownProps = {
  subtotalPrice: number;
  promoCode: string | null;
  promoDiscountAmount: number;
  quantityLabel: string;
  uniqueCode: number;
  transferAmount: number;
  contactWhatsappNumber: string;
  contactWhatsappLabel: string;
};

export function PaymentBreakdown({
  subtotalPrice,
  promoCode,
  promoDiscountAmount,
  quantityLabel,
  uniqueCode,
  transferAmount,
  contactWhatsappNumber,
  contactWhatsappLabel,
}: PaymentBreakdownProps) {
  const hasWhatsappContact = Boolean(normalizeWhatsappNumber(contactWhatsappNumber));

  return (
    <div className="rounded-[24px] border border-line bg-white/60 p-5">
      <p className="text-sm uppercase tracking-[0.22em] text-muted">
        Ringkasan Pembayaran
      </p>

      <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
        <div className="flex items-center justify-between gap-4">
          <span>Subtotal</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(subtotalPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Seat / item</span>
          <span className="font-semibold text-foreground">{quantityLabel}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Promo</span>
          <span className="font-semibold text-foreground">
            {promoCode && promoDiscountAmount > 0
              ? `${promoCode} (-${formatCurrency(promoDiscountAmount)})`
              : "-"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Kode unik</span>
          <span className="font-semibold text-foreground">
            {uniqueCode > 0 ? formatUniqueCode(uniqueCode) : "-"}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-brand/20 bg-brand/5 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Total transfer
        </p>
        <p className="mt-2 text-3xl font-black text-foreground">
          {formatCurrency(transferAmount)}
        </p>
        <p className="mt-2 text-sm leading-7 text-muted">
          Transfer sesuai total akhir ini agar admin lebih mudah mencocokkan mutasi.
        </p>
      </div>

      {hasWhatsappContact ? (
        <Link
          href={formatWhatsappHref(contactWhatsappNumber)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium transition hover:bg-background"
        >
          <MessageCircle className="h-4 w-4" />
          {contactWhatsappLabel || "Kontak WhatsApp"}
        </Link>
      ) : null}
    </div>
  );
}
