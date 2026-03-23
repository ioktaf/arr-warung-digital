"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProductBySlug } from "@/lib/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildCheckoutUrl(slug: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `/checkout/${slug}?${query}` : `/checkout/${slug}`;
}

export async function beginCheckoutAction(formData: FormData) {
  const slug = getTextValue(formData.get("slug"));
  const buyerName = getTextValue(formData.get("buyerName"));
  const buyerWa = getTextValue(formData.get("buyerWa"));

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

  if (buyerName.length < 2 || buyerWa.replace(/\D/g, "").length < 8) {
    searchParams.set("error", "Isi nama dan nomor WhatsApp yang valid dulu.");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    redirect("/");
  }

  if (!hasServiceRoleSupabaseEnv()) {
    searchParams.set("demo", "1");
    searchParams.set("step", "payment");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    searchParams.set("demo", "1");
    searchParams.set("step", "payment");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      product_id: product.id,
      buyer_name: buyerName,
      buyer_wa: buyerWa,
      total_price: product.price,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create order", error?.message);
    searchParams.set("error", "Order gagal dibuat. Coba submit lagi.");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  revalidatePath("/admin");
  searchParams.set("order", data.id);
  searchParams.set("step", "payment");
  redirect(buildCheckoutUrl(slug, searchParams));
}

export async function confirmPaymentAction(formData: FormData) {
  const slug = getTextValue(formData.get("slug"));
  const orderId = getTextValue(formData.get("orderId"));
  const buyerName = getTextValue(formData.get("buyerName"));
  const buyerWa = getTextValue(formData.get("buyerWa"));
  const paymentNote = getTextValue(formData.get("paymentNote"));
  const proofFile = formData.get("proofFile");

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

  if (orderId) {
    searchParams.set("order", orderId);
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
