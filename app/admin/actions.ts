"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/lib/data";
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
    throw new Error("Gagal mengubah status order.");
  }

  revalidatePath("/admin");

  if (productSlug) {
    revalidatePath(`/checkout/${productSlug}`);
  }
}
