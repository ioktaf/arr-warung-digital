"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin-auth";
import {
  createProduct,
  deleteProduct,
  setProductActive,
  updateProduct,
} from "@/lib/data";
import type { ProductDraft } from "@/types/domain";

type NoticeTone = "success" | "danger" | "accent";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return Number.NaN;
  }

  return Number.parseFloat(value);
}

function getCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

function redirectToProducts(notice: string, tone: NoticeTone = "success"): never {
  const searchParams = new URLSearchParams({
    notice,
    tone,
  });

  redirect(`/admin/products?${searchParams.toString()}`);
}

function revalidateProductRoutes(previousSlug?: string | null, nextSlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  if (previousSlug) {
    revalidatePath(`/checkout/${previousSlug}`);
  }

  if (nextSlug && nextSlug !== previousSlug) {
    revalidatePath(`/checkout/${nextSlug}`);
  }
}

function buildProductDraft(formData: FormData): ProductDraft | null {
  const title = getTextValue(formData.get("title"));
  const price = getNumberValue(formData.get("price"));
  const stock = getNumberValue(formData.get("stock"));

  if (!title || Number.isNaN(price) || Number.isNaN(stock)) {
    return null;
  }

  return {
    title,
    slug: getTextValue(formData.get("slug")),
    price,
    description: getTextValue(formData.get("description")),
    category: getTextValue(formData.get("category")),
    imageUrl: getTextValue(formData.get("imageUrl")) || null,
    stock,
    isActive: getCheckboxValue(formData.get("isActive")),
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdminSession();

  const draft = buildProductDraft(formData);

  if (!draft) {
    redirectToProducts("Data produk belum lengkap. Cek judul, harga, dan stok.", "danger");
  }

  const result = await createProduct(draft);

  if (!result.ok) {
    redirectToProducts(
      result.message ?? "Produk gagal ditambahkan. Coba lagi sebentar.",
      "danger",
    );
  }

  revalidateProductRoutes(undefined, result.product?.slug ?? null);
  redirectToProducts("Produk baru berhasil ditambahkan.");
}

export async function updateProductAction(formData: FormData) {
  await requireAdminSession();

  const productId = getTextValue(formData.get("productId"));
  const draft = buildProductDraft(formData);

  if (!productId || !draft) {
    redirectToProducts("Data produk belum lengkap. Cek judul, harga, dan stok.", "danger");
  }

  const result = await updateProduct(productId, draft);

  if (!result.ok) {
    redirectToProducts(
      result.message ?? "Produk gagal diperbarui. Coba lagi sebentar.",
      "danger",
    );
  }

  revalidateProductRoutes(result.previousSlug, result.product?.slug ?? draft.slug);
  redirectToProducts("Perubahan produk berhasil disimpan.");
}

export async function toggleProductStatusAction(formData: FormData) {
  await requireAdminSession();

  const productId = getTextValue(formData.get("productId"));
  const nextIsActive = getCheckboxValue(formData.get("nextIsActive"));

  if (!productId) {
    redirectToProducts("Produk tidak ditemukan.", "danger");
  }

  const result = await setProductActive(productId, nextIsActive);

  if (!result.ok) {
    redirectToProducts(
      result.message ?? "Status produk gagal diubah. Coba lagi sebentar.",
      "danger",
    );
  }

  revalidateProductRoutes(result.previousSlug, result.product?.slug ?? result.previousSlug);
  redirectToProducts(
    nextIsActive ? "Produk berhasil diaktifkan." : "Produk berhasil dinonaktifkan.",
    "success",
  );
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminSession();

  const productId = getTextValue(formData.get("productId"));

  if (!productId) {
    redirectToProducts("Produk tidak ditemukan.", "danger");
  }

  const result = await deleteProduct(productId);

  if (!result.ok) {
    redirectToProducts(
      result.message ?? "Produk gagal dihapus. Coba lagi sebentar.",
      "danger",
    );
  }

  revalidateProductRoutes(result.previousSlug, undefined);
  redirectToProducts("Produk berhasil dihapus.", "success");
}
