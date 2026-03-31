import { mockOrders } from "@/lib/mock-data";
import {
  getMissingPromoSchemaMessage,
  isMissingPromoSchemaError,
  resolvePromoCodeForSubtotal,
} from "@/lib/promo-codes";
import { recordSystemEvent } from "@/lib/system-events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { notifyAdminOrderCreated } from "@/lib/telegram";
import type { Product } from "@/types/domain";

const ACTIVE_ORDER_STATUSES = ["pending", "awaiting_verification", "paid"] as const;
export const MAX_UNIQUE_CODE = 299;

export type DraftCheckoutItem = {
  product: Product;
  quantity: number;
};

export type CreateCheckoutOrderResult =
  | {
      ok: true;
      mode: "live" | "mock";
      orderId: string | null;
      promoCode: string | null;
      promoDiscountAmount: number;
      uniqueCode: number;
      subtotalPrice: number;
      totalPrice: number;
    }
  | {
      ok: false;
      mode: "live" | "mock";
      message: string;
    };

export function clampCheckoutQuantity(quantity: number, stock: number) {
  const safeStock = Math.max(0, Math.floor(stock));
  const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;

  if (safeStock === 0) {
    return 0;
  }

  return Math.min(Math.max(safeQuantity, 1), safeStock);
}

function getAvailableUniqueCode(takenCodes: number[]) {
  const taken = new Set(
    takenCodes.filter(
      (value) => Number.isInteger(value) && value > 0 && value <= MAX_UNIQUE_CODE,
    ),
  );

  for (let attempt = 0; attempt < MAX_UNIQUE_CODE * 2; attempt += 1) {
    const candidate = Math.floor(Math.random() * MAX_UNIQUE_CODE) + 1;

    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  for (let candidate = 1; candidate <= MAX_UNIQUE_CODE; candidate += 1) {
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  return Math.floor(Date.now() % MAX_UNIQUE_CODE) + 1;
}

export function parseUniqueCode(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.min(parsed, MAX_UNIQUE_CODE);
}

export function isMissingUniqueCodeColumnError(message: string | undefined) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes("unique_code") &&
    (normalized.includes("schema cache") ||
      normalized.includes("does not exist") ||
      normalized.includes("column"))
  );
}

function isMissingOrderItemsTableError(message: string | undefined) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes("order_items") &&
    (normalized.includes("schema cache") ||
      normalized.includes("does not exist") ||
      normalized.includes("relation") ||
      normalized.includes("table"))
  );
}

export function getMissingOrderSchemaMessage() {
  return "Schema order belum update untuk kode unik/keranjang. Jalankan schema.sql terbaru di Supabase.";
}

function getSubtotalPrice(items: DraftCheckoutItem[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export async function createCheckoutOrder(
  items: DraftCheckoutItem[],
  buyerName: string,
  buyerWa: string,
  promoCodeInput = "",
): Promise<CreateCheckoutOrderResult> {
  const normalizedItems = items
    .map((item) => ({
      product: item.product,
      quantity: clampCheckoutQuantity(item.quantity, item.product.stock),
    }))
    .filter((item) => item.quantity > 0);

  if (!normalizedItems.length) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: "Keranjang checkout kosong atau quantity tidak valid.",
    };
  }

  const subtotalPrice = getSubtotalPrice(normalizedItems);
  const promoResult = await resolvePromoCodeForSubtotal(promoCodeInput, subtotalPrice);

  if (!promoResult.ok) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: promoResult.message,
    };
  }

  const promoCode = promoResult.promo?.code ?? null;
  const promoCodeId = promoResult.promo?.id ?? null;
  const promoDiscountAmount = promoResult.discountAmount;
  const discountedSubtotalPrice = Math.max(subtotalPrice - promoDiscountAmount, 0);

  if (!hasServiceRoleSupabaseEnv()) {
    const uniqueCode = getAvailableUniqueCode(mockOrders.map((order) => order.uniqueCode));

    return {
      ok: true,
      mode: "mock",
      orderId: null,
      promoCode,
      promoDiscountAmount,
      uniqueCode,
      subtotalPrice,
      totalPrice: discountedSubtotalPrice + uniqueCode,
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const uniqueCode = getAvailableUniqueCode(mockOrders.map((order) => order.uniqueCode));

    return {
      ok: true,
      mode: "mock",
      orderId: null,
      promoCode,
      promoDiscountAmount,
      uniqueCode,
      subtotalPrice,
      totalPrice: discountedSubtotalPrice + uniqueCode,
    };
  }

  const { data: existingOrders, error: uniqueCodeError } = await supabase
    .from("orders")
    .select("unique_code")
    .in("status", [...ACTIVE_ORDER_STATUSES]);

  if (uniqueCodeError) {
    console.error("Failed to read used unique codes", uniqueCodeError.message);
    await recordSystemEvent({
      source: "order-checkout",
      severity: "warning",
      message: "Gagal membaca unique code yang sedang aktif.",
      details: {
        error: uniqueCodeError.message,
      },
    });

    if (isMissingUniqueCodeColumnError(uniqueCodeError.message)) {
      return {
        ok: false,
        mode: "live",
        message: getMissingOrderSchemaMessage(),
      };
    }
  }

  const uniqueCode = getAvailableUniqueCode(
    (existingOrders ?? []).flatMap((item) => {
      const candidate =
        item && typeof item === "object" && "unique_code" in item
          ? item.unique_code
          : null;

      return typeof candidate === "number" ? [candidate] : [];
    }),
  );

  const totalPrice = discountedSubtotalPrice + uniqueCode;
  const primaryProduct = normalizedItems[0].product;

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      product_id: primaryProduct.id,
      buyer_name: buyerName,
      buyer_wa: buyerWa,
      promo_code_id: promoCodeId,
      promo_code: promoCode,
      promo_discount_amount: promoDiscountAmount,
      unique_code: uniqueCode,
      total_price: totalPrice,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    console.error("Failed to create order", orderError?.message);
    await recordSystemEvent({
      source: "order-checkout",
      severity: "error",
      message: "Pembuatan order gagal.",
      details: {
        error: orderError?.message ?? "unknown-error",
        buyerName,
        buyerWa,
      },
    });
    return {
      ok: false,
      mode: "live",
      message:
        isMissingUniqueCodeColumnError(orderError?.message) ||
        isMissingPromoSchemaError(orderError?.message)
          ? isMissingPromoSchemaError(orderError?.message)
            ? getMissingPromoSchemaMessage()
            : getMissingOrderSchemaMessage()
          : "Order gagal dibuat. Coba submit lagi.",
    };
  }

  const { error: itemError } = await supabase.from("order_items").insert(
    normalizedItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      subtotal_price: item.product.price * item.quantity,
    })),
  );

  if (itemError) {
    console.error("Failed to create order items", itemError.message);
    await recordSystemEvent({
      source: "order-checkout",
      severity: "error",
      message: "Penyimpanan order items gagal.",
      details: {
        orderId: orderData.id,
        error: itemError.message,
      },
    });
    await supabase.from("orders").delete().eq("id", orderData.id);

    return {
      ok: false,
      mode: "live",
      message: isMissingOrderItemsTableError(itemError.message)
        ? getMissingOrderSchemaMessage()
        : "Item order gagal disimpan. Coba submit lagi.",
    };
  }

  await notifyAdminOrderCreated({
    orderId: orderData.id,
    buyerName,
    buyerWa,
    totalPrice,
    totalQuantity: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    promoCode,
    itemSummary: normalizedItems.map((item) => `${item.quantity}x ${item.product.title}`),
  });

  return {
    ok: true,
    mode: "live",
    orderId: orderData.id,
    promoCode,
    promoDiscountAmount,
    uniqueCode,
    subtotalPrice,
    totalPrice,
  };
}
