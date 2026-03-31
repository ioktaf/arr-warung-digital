import { formatCurrency, formatUniqueCode } from "@/lib/format";
import { formatWhatsappDisplay } from "@/lib/utils";
import { recordSystemEvent } from "@/lib/system-events";

type TelegramNotificationResult = {
  ok: boolean;
  skipped?: boolean;
};

function getTelegramEnv() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN?.trim(),
    chatId: process.env.TELEGRAM_CHAT_ID?.trim(),
  };
}

export function hasTelegramNotificationEnv() {
  const { token, chatId } = getTelegramEnv();
  return Boolean(token && chatId);
}

async function sendTelegramMessage(text: string): Promise<TelegramNotificationResult> {
  const { token, chatId } = getTelegramEnv();

  if (!token || !chatId) {
    return {
      ok: false,
      skipped: true,
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const payload = await response.text();

      await recordSystemEvent({
        source: "telegram",
        severity: "error",
        message: "Telegram notification gagal dikirim.",
        details: {
          status: response.status,
          payload,
        },
      });

      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    await recordSystemEvent({
      source: "telegram",
      severity: "error",
      message: "Telegram notification gagal karena exception.",
      details: {
        error: error instanceof Error ? error.message : "unknown-error",
      },
    });

    return { ok: false };
  }
}

function getAdminDashboardUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const safeBaseUrl = siteUrl && /^https?:\/\//.test(siteUrl)
    ? siteUrl.replace(/\/$/, "")
    : "https://www.arrwarungdigital.com";

  return `${safeBaseUrl}/admin`;
}

export async function notifyAdminOrderCreated(input: {
  orderId: string;
  buyerName: string;
  buyerWa: string;
  totalPrice: number;
  totalQuantity: number;
  promoCode?: string | null;
  itemSummary: string[];
}) {
  return sendTelegramMessage(
    [
      "Order baru masuk",
      `Ref: #${input.orderId.slice(0, 8)}`,
      `Buyer: ${input.buyerName}`,
      `WA: ${formatWhatsappDisplay(input.buyerWa)}`,
      `Seat: ${input.totalQuantity}`,
      `Total: ${formatCurrency(input.totalPrice)}`,
      input.promoCode ? `Promo: ${input.promoCode}` : null,
      `Item: ${input.itemSummary.join(", ")}`,
      `Dashboard: ${getAdminDashboardUrl()}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export async function notifyAdminPaymentConfirmation(input: {
  orderId: string;
  buyerName: string;
  buyerWa: string;
  totalPrice: number;
  uniqueCode: number;
  paymentNote?: string | null;
}) {
  return sendTelegramMessage(
    [
      "Buyer klik konfirmasi bayar",
      `Ref: #${input.orderId.slice(0, 8)}`,
      `Buyer: ${input.buyerName}`,
      `WA: ${formatWhatsappDisplay(input.buyerWa)}`,
      `Total transfer: ${formatCurrency(input.totalPrice)}`,
      input.uniqueCode > 0 ? `Kode unik: ${formatUniqueCode(input.uniqueCode)}` : null,
      input.paymentNote ? `Catatan: ${input.paymentNote}` : null,
      `Dashboard: ${getAdminDashboardUrl()}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export async function notifyAdminOrderStatusChanged(input: {
  orderId: string;
  buyerName: string;
  totalPrice: number;
  nextStatus: string;
}) {
  return sendTelegramMessage(
    [
      "Status order berubah",
      `Ref: #${input.orderId.slice(0, 8)}`,
      `Buyer: ${input.buyerName}`,
      `Status baru: ${input.nextStatus}`,
      `Total: ${formatCurrency(input.totalPrice)}`,
      `Dashboard: ${getAdminDashboardUrl()}`,
    ].join("\n"),
  );
}
