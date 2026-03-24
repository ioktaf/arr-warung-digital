"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProductBySlug } from "@/lib/data";
import {
  clampCheckoutQuantity,
  createCheckoutOrder,
  parseUniqueCode,
} from "@/lib/order-checkout";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { normalizeWhatsappNumber } from "@/lib/utils";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildCheckoutUrl(slug: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `/checkout/${slug}?${query}` : `/checkout/${slug}`;
}

function getRequestedQuantity(value: string, stock: number) {
  return clampCheckoutQuantity(Number.parseInt(value, 10), stock);
}

export async function beginCheckoutAction(formData: FormData) {
  const slug = getTextValue(formData.get("slug"));
  const buyerName = getTextValue(formData.get("buyerName"));
  const buyerWa = normalizeWhatsappNumber(getTextValue(formData.get("buyerWa")));
  const promoCode = getTextValue(formData.get("promoCode"));

  if (!slug) {
    redirect("/");
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    redirect("/");
  }

  const quantity = getRequestedQuantity(
    getTextValue(formData.get("quantity")),
    product.stock,
  );
  const searchParams = new URLSearchParams();

  if (buyerName) {
    searchParams.set("buyerName", buyerName);
  }

  if (buyerWa) {
    searchParams.set("buyerWa", buyerWa);
  }

  if (promoCode) {
    searchParams.set("promo", promoCode);
  }

  searchParams.set("quantity", String(quantity));

  if (quantity <= 0) {
    searchParams.set("error", "Stok produk ini sedang habis.");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  if (buyerName.length < 2 || buyerWa.length < 10) {
    searchParams.set("error", "Isi nama dan nomor WhatsApp yang valid dulu.");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const result = await createCheckoutOrder(
    [{ product, quantity }],
    buyerName,
    buyerWa,
    promoCode,
  );

  if (!result.ok) {
    searchParams.set("error", result.message);
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  searchParams.set("uniqueCode", String(result.uniqueCode));
  searchParams.set("step", "payment");

  if (result.orderId) {
    revalidatePath("/admin");
    searchParams.set("order", result.orderId);
  } else {
    searchParams.set("demo", "1");
  }

  redirect(buildCheckoutUrl(slug, searchParams));
}

export async function confirmPaymentAction(formData: FormData) {
  const slug = getTextValue(formData.get("slug"));
  const orderId = getTextValue(formData.get("orderId"));
  const buyerName = getTextValue(formData.get("buyerName"));
  const buyerWa = normalizeWhatsappNumber(getTextValue(formData.get("buyerWa")));
  const promoCode = getTextValue(formData.get("promoCode"));
  const uniqueCode = parseUniqueCode(getTextValue(formData.get("uniqueCode")));
  const paymentNote = getTextValue(formData.get("paymentNote"));
  const proofFile = formData.get("proofFile");
  const quantity = getTextValue(formData.get("quantity"));

  if (!slug) {
    redirect("/");
  }

  const searchParams = new URLSearchParams();

  if (buyerName) {
    searchParams.set("buyerName", buyerName);
  }

  if (buyerWa) {
    searchParams.set("buyerWa", buyerWa);
  }

  if (promoCode) {
    searchParams.set("promo", promoCode);
  }

  if (quantity) {
    searchParams.set("quantity", quantity);
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
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    searchParams.set("demo", "1");
    searchParams.set("step", "awaiting-verification");
    searchParams.set("success", "1");
    redirect(buildCheckoutUrl(slug, searchParams));
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
      searchParams.set("error", "Bukti bayar gagal diupload. Coba ulang lagi.");
      redirect(buildCheckoutUrl(slug, searchParams));
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
    console.error("Failed to update order confirmation", error.message);
    searchParams.set("error", "Konfirmasi bayar gagal dikirim.");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  revalidatePath("/admin");
  searchParams.set("step", "awaiting-verification");
  searchParams.set("success", "1");
  redirect(buildCheckoutUrl(slug, searchParams));
}
