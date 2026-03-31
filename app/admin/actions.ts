"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { recordAdminActivity } from "@/lib/admin-audit";
import { getCheckoutOrder, updateOrderStatus } from "@/lib/data";
import { recordSystemEvent } from "@/lib/system-events";
import { notifyAdminOrderStatusChanged } from "@/lib/telegram";
import { ORDER_STATUSES, type OrderStatus } from "@/types/domain";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminSession();

  const orderId = getTextValue(formData.get("orderId"));
  const productSlug = getTextValue(formData.get("productSlug"));
  const nextStatus = getTextValue(formData.get("nextStatus"));

  if (!orderId || !isOrderStatus(nextStatus)) {
    return;
  }

  const result = await updateOrderStatus(orderId, nextStatus);

  if (!result.ok) {
    await recordSystemEvent({
      source: "admin-order-status",
      severity: "error",
      message: "Admin gagal mengubah status order.",
      details: {
        orderId,
        nextStatus,
      },
    });
    throw new Error("Gagal mengubah status order.");
  }

  const order = await getCheckoutOrder(orderId);

  await recordAdminActivity({
    action: "order_status_updated",
    targetType: "order",
    targetId: orderId,
    summary: `Status order #${orderId.slice(0, 8)} diubah ke ${nextStatus}.`,
    details: {
      nextStatus,
      buyerName: order?.buyerName ?? null,
      totalPrice: order?.totalPrice ?? null,
    },
  });

  if (order) {
    await notifyAdminOrderStatusChanged({
      orderId: order.id,
      buyerName: order.buyerName,
      totalPrice: order.totalPrice,
      nextStatus,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/track");

  if (productSlug) {
    revalidatePath(`/checkout/${productSlug}`);
  }
}
