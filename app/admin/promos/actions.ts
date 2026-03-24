"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin-auth";
import {
  createPromoCode,
  deletePromoCode,
  setPromoCodeActive,
  updatePromoCode,
} from "@/lib/promo-codes";
import type { PromoCodeDraft, PromoDiscountType } from "@/types/domain";

type NoticeTone = "success" | "danger" | "accent";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return Number.NaN;
  }

  return Number.parseFloat(value);
}

function getOptionalNumberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

function getDiscountTypeValue(value: FormDataEntryValue | null): PromoDiscountType {
  return value === "percent" ? "percent" : "fixed";
}

function redirectToPromos(notice: string, tone: NoticeTone = "success"): never {
  const searchParams = new URLSearchParams({
    notice,
    tone,
  });

  redirect(`/admin/promos?${searchParams.toString()}`);
}

function revalidatePromoRoutes() {
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/track");
  revalidatePath("/admin");
  revalidatePath("/admin/promos");
  revalidatePath("/checkout/[slug]", "page");
  revalidatePath("/checkout/cart", "page");
}

function buildPromoDraft(formData: FormData): PromoCodeDraft | null {
  const discountValue = getNumberValue(formData.get("discountValue"));
  const minimumSubtotal = getNumberValue(formData.get("minimumSubtotal"));

  if (Number.isNaN(discountValue) || Number.isNaN(minimumSubtotal)) {
    return null;
  }

  return {
    code: getTextValue(formData.get("code")),
    label: getTextValue(formData.get("label")),
    description: getTextValue(formData.get("description")),
    discountType: getDiscountTypeValue(formData.get("discountType")),
    discountValue,
    minimumSubtotal,
    maxDiscount: getOptionalNumberValue(formData.get("maxDiscount")),
    isActive: getCheckboxValue(formData.get("isActive")),
  };
}

export async function createPromoCodeAction(formData: FormData) {
  await requireAdminSession();

  const draft = buildPromoDraft(formData);

  if (!draft) {
    redirectToPromos("Data promo belum lengkap. Cek nilai diskon dan minimum subtotal.", "danger");
  }

  const result = await createPromoCode(draft);

  if (!result.ok) {
    redirectToPromos(result.message, "danger");
  }

  revalidatePromoRoutes();
  redirectToPromos("Kode promo berhasil ditambahkan.");
}

export async function updatePromoCodeAction(formData: FormData) {
  await requireAdminSession();

  const promoId = getTextValue(formData.get("promoId"));
  const draft = buildPromoDraft(formData);

  if (!promoId || !draft) {
    redirectToPromos("Data promo belum lengkap. Cek nilai diskon dan minimum subtotal.", "danger");
  }

  const result = await updatePromoCode(promoId, draft);

  if (!result.ok) {
    redirectToPromos(result.message, "danger");
  }

  revalidatePromoRoutes();
  redirectToPromos("Perubahan promo berhasil disimpan.");
}

export async function togglePromoCodeStatusAction(formData: FormData) {
  await requireAdminSession();

  const promoId = getTextValue(formData.get("promoId"));
  const nextIsActive = getCheckboxValue(formData.get("nextIsActive"));

  if (!promoId) {
    redirectToPromos("Promo tidak ditemukan.", "danger");
  }

  const result = await setPromoCodeActive(promoId, nextIsActive);

  if (!result.ok) {
    redirectToPromos(result.message, "danger");
  }

  revalidatePromoRoutes();
  redirectToPromos(
    nextIsActive ? "Promo berhasil diaktifkan." : "Promo berhasil dinonaktifkan.",
  );
}

export async function deletePromoCodeAction(formData: FormData) {
  await requireAdminSession();

  const promoId = getTextValue(formData.get("promoId"));

  if (!promoId) {
    redirectToPromos("Promo tidak ditemukan.", "danger");
  }

  const result = await deletePromoCode(promoId);

  if (!result.ok) {
    redirectToPromos(result.message, "danger");
  }

  revalidatePromoRoutes();
  redirectToPromos("Promo berhasil dihapus.");
}
