"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseCartItemsPayload } from "@/lib/cart";
import { getProductsByIds } from "@/lib/data";
import { clampCheckoutQuantity, createCheckoutOrder, parseUniqueCode } from "@/lib/order-checkout";
import { recordSystemEvent } from "@/lib/system-events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { notifyAdminPaymentConfirmation } from "@/lib/telegram";
import { normalizeWhatsappNumber } from "@/lib/utils";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildCartCheckoutUrl(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `/checkout/cart?${query}` : "/checkout/cart";
}

export async function beginCartCheckoutAction(formData: FormData) {
  const cartPayload = getTextValue(formData.get("cartPayload"));
  const buyerName = getTextValue(formData.get("buyerName"));
  const buyerWa = normalizeWhatsappNumber(getTextValue(formData.get("buyerWa")));
  const promoCode = getTextValue(formData.get("promoCode"));
  const searchParams = new URLSearchParams();

  if (cartPayload) {
    searchParams.set("cart", cartPayload);
  }

  if (buyerName) {
    searchParams.set("buyerName", buyerName);
  }

  if (buyerWa) {
    searchParams.set("buyerWa", buyerWa);
  }

  if (promoCode) {
    searchParams.set("promo", promoCode);
  }

  if (buyerName.length < 2 || buyerWa.length < 10) {
    searchParams.set("error", "Isi nama dan nomor WhatsApp yang valid dulu.");
    redirect(buildCartCheckoutUrl(searchParams));
  }

  const cartLines = parseCartItemsPayload(cartPayload);
  const products = await getProductsByIds(cartLines.map((item) => item.productId));
  const productMap = new Map(products.map((product) => [product.id, product]));
  const items = cartLines.flatMap((line) => {
    const product = productMap.get(line.productId);

    if (!product) {
      return [];
    }

    return [
      {
        product,
        quantity: clampCheckoutQuantity(line.quantity, product.stock),
      },
    ];
  });

  if (!items.length) {
    searchParams.set("error", "Keranjang kosong atau ada produk yang sudah tidak aktif.");
    redirect(buildCartCheckoutUrl(searchParams));
  }

  const result = await createCheckoutOrder(items, buyerName, buyerWa, promoCode);

  if (!result.ok) {
    searchParams.set("error", result.message);
    redirect(buildCartCheckoutUrl(searchParams));
  }

  searchParams.set("uniqueCode", String(result.uniqueCode));
  searchParams.set("step", "payment");

  if (result.orderId) {
    revalidatePath("/admin");
    searchParams.set("order", result.orderId);
  } else {
    searchParams.set("demo", "1");
  }

  redirect(buildCartCheckoutUrl(searchParams));
}

export async function confirmCartPaymentAction(formData: FormData) {
  const orderId = getTextValue(formData.get("orderId"));
  const cartPayload = getTextValue(formData.get("cartPayload"));
  const buyerName = getTextValue(formData.get("buyerName"));
  const buyerWa = normalizeWhatsappNumber(getTextValue(formData.get("buyerWa")));
  const promoCode = getTextValue(formData.get("promoCode"));
  const uniqueCode = parseUniqueCode(getTextValue(formData.get("uniqueCode")));
  const paymentNote = getTextValue(formData.get("paymentNote"));
  const proofFile = formData.get("proofFile");
  const searchParams = new URLSearchParams();

  if (cartPayload) {
    searchParams.set("cart", cartPayload);
  }

  if (buyerName) {
    searchParams.set("buyerName", buyerName);
  }

  if (buyerWa) {
    searchParams.set("buyerWa", buyerWa);
  }

  if (promoCode) {
    searchParams.set("promo", promoCode);
  }

  if (orderId) {
    searchParams.set("order", orderId);
  }

  if (uniqueCode > 0) {
    searchParams.set("uniqueCode", String(uniqueCode));
  }

  if (!hasServiceRoleSupabaseEnv() || !orderId) {
    searchParams.set("demo", "1");
    searchParams.set("step", "awaiting-verification");
    searchParams.set("success", "1");
    redirect(buildCartCheckoutUrl(searchParams));
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    searchParams.set("demo", "1");
    searchParams.set("step", "awaiting-verification");
    searchParams.set("success", "1");
    redirect(buildCartCheckoutUrl(searchParams));
  }

  let proofPath: string | null = null;

  if (proofFile instanceof File && proofFile.size > 0) {
    const originalExtension = proofFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const extension = ["jpg", "jpeg", "png", "webp"].includes(originalExtension)
      ? originalExtension
      : "jpg";
    const storagePath = `${orderId}/${Date.now()}-proof.${extension}`;
    const fileBuffer = await proofFile.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(storagePath, fileBuffer, {
        contentType: proofFile.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload proof file", uploadError.message);
      await recordSystemEvent({
        source: "checkout-proof-upload",
        severity: "error",
        message: "Upload bukti bayar checkout keranjang gagal.",
        details: {
          orderId,
          error: uploadError.message,
        },
      });
      searchParams.set("error", "Bukti bayar gagal diupload. Coba ulang lagi.");
      redirect(buildCartCheckoutUrl(searchParams));
    }

    proofPath = storagePath;
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "awaiting_verification",
      payment_note: paymentNote || null,
      proof_img_url: proofPath,
      payment_confirmed_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to update cart order confirmation", error.message);
    await recordSystemEvent({
      source: "checkout-confirmation",
      severity: "error",
      message: "Konfirmasi pembayaran checkout keranjang gagal diupdate.",
      details: {
        orderId,
        error: error.message,
      },
    });
    searchParams.set("error", "Konfirmasi bayar gagal dikirim.");
    redirect(buildCartCheckoutUrl(searchParams));
  }

  const { data: orderSnapshot } = await supabase
    .from("orders")
    .select("total_price")
    .eq("id", orderId)
    .maybeSingle();

  await notifyAdminPaymentConfirmation({
    orderId,
    buyerName,
    buyerWa,
    totalPrice:
      typeof orderSnapshot?.total_price === "number"
        ? orderSnapshot.total_price
        : Number.parseFloat(String(orderSnapshot?.total_price ?? 0)),
    uniqueCode,
    paymentNote,
  });

  revalidatePath("/admin");
  searchParams.set("step", "awaiting-verification");
  searchParams.set("success", "1");
  redirect(buildCartCheckoutUrl(searchParams));
}
