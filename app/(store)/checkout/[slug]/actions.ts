"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { mockOrders } from "@/lib/mock-data";
import { getProductBySlug } from "@/lib/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { normalizeWhatsappNumber } from "@/lib/utils";

const ACTIVE_ORDER_STATUSES = ["pending", "awaiting_verification", "paid"] as const;
const MAX_UNIQUE_CODE = 999;

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildCheckoutUrl(slug: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `/checkout/${slug}?${query}` : `/checkout/${slug}`;
}

function parseUniqueCode(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.min(parsed, MAX_UNIQUE_CODE);
}

function getAvailableUniqueCode(takenCodes: number[]) {
  const taken = new Set(
    takenCodes.filter((value) => Number.isInteger(value) && value > 0 && value <= MAX_UNIQUE_CODE),
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

function isMissingUniqueCodeColumnError(message: string | undefined) {
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

export async function beginCheckoutAction(formData: FormData) {
  const slug = getTextValue(formData.get("slug"));
  const buyerName = getTextValue(formData.get("buyerName"));
  const buyerWa = normalizeWhatsappNumber(getTextValue(formData.get("buyerWa")));

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

  if (buyerName.length < 2 || buyerWa.length < 10) {
    searchParams.set("error", "Isi nama dan nomor WhatsApp yang valid dulu.");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    redirect("/");
  }

  if (!hasServiceRoleSupabaseEnv()) {
    const uniqueCode = getAvailableUniqueCode(mockOrders.map((order) => order.uniqueCode));
    searchParams.set("uniqueCode", String(uniqueCode));
    searchParams.set("demo", "1");
    searchParams.set("step", "payment");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const uniqueCode = getAvailableUniqueCode(mockOrders.map((order) => order.uniqueCode));
    searchParams.set("uniqueCode", String(uniqueCode));
    searchParams.set("demo", "1");
    searchParams.set("step", "payment");
    redirect(buildCheckoutUrl(slug, searchParams));
  }

  const { data: existingOrders, error: uniqueCodeError } = await supabase
    .from("orders")
    .select("unique_code")
    .in("status", [...ACTIVE_ORDER_STATUSES]);

  if (uniqueCodeError) {
    console.error("Failed to read used unique codes", uniqueCodeError.message);

    if (isMissingUniqueCodeColumnError(uniqueCodeError.message)) {
      searchParams.set(
        "error",
        "Schema order belum update untuk kode unik. Jalankan schema.sql terbaru di Supabase.",
      );
      redirect(buildCheckoutUrl(slug, searchParams));
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

  const { data, error } = await supabase
    .from("orders")
    .insert({
      product_id: product.id,
      buyer_name: buyerName,
      buyer_wa: buyerWa,
      unique_code: uniqueCode,
      total_price: product.price + uniqueCode,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create order", error?.message);
    searchParams.set(
      "error",
      isMissingUniqueCodeColumnError(error?.message)
        ? "Schema order belum update untuk kode unik. Jalankan schema.sql terbaru di Supabase."
        : "Order gagal dibuat. Coba submit lagi.",
    );
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
  const buyerWa = normalizeWhatsappNumber(getTextValue(formData.get("buyerWa")));
  const uniqueCode = parseUniqueCode(getTextValue(formData.get("uniqueCode")));
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
