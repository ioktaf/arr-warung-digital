import {
  createMockProduct,
  deleteMockProduct,
  mockOrders,
  mockProducts,
  mockStoreSettings,
  setMockProductActive,
  updateMockOrderStatus,
  updateMockProduct,
  updateMockStoreSettings,
} from "@/lib/mock-data";
import { getOrderStatusUpdatePayload } from "@/lib/order-status";
import {
  defaultStoreSettings,
  extractStoreSettingsInput,
  normalizeStoreSettingsInput,
} from "@/lib/store-settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  hasPublicSupabaseEnv,
  hasServiceRoleSupabaseEnv,
} from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type {
  Order,
  OrderStatus,
  Product,
  ProductDraft,
  StoreSettings,
  StoreSettingsInput,
  StoreWorkflowStep,
} from "@/types/domain";

type ProductRow = {
  id: string;
  title: string;
  slug: string | null;
  price: number | string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
};

type OrderRow = {
  id: string;
  buyer_name: string;
  buyer_wa: string;
  total_price: number | string;
  status: OrderStatus;
  proof_img_url: string | null;
  payment_note: string | null;
  admin_note: string | null;
  payment_confirmed_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  product: ProductRow | ProductRow[] | null;
};

type StoreSettingsRow = {
  id: string;
  key: string;
  hero_badge: string | null;
  hero_title: string | null;
  hero_description: string | null;
  hero_primary_cta_label: string | null;
  hero_secondary_cta_label: string | null;
  workflow_badge: string | null;
  workflow_title: string | null;
  workflow_description: string | null;
  workflow_steps: unknown;
  catalog_badge: string | null;
  catalog_title: string | null;
  catalog_description: string | null;
  stack_badge: string | null;
  stack_highlights: unknown;
  dashboard_badge: string | null;
  dashboard_notes: unknown;
  payment_display_label: string | null;
  payment_qris_payload: string | null;
  payment_merchant_name: string | null;
  payment_merchant_city: string | null;
  payment_checkout_title: string | null;
  payment_checkout_description: string | null;
  payment_instruction_lines: unknown;
  updated_at: string;
};

type ProductMutationResult = {
  ok: boolean;
  mode: "live" | "mock";
  message?: string;
  product?: Product | null;
  previousSlug?: string | null;
};

type StoreSettingsMutationResult = {
  ok: boolean;
  mode: "live" | "mock";
  message?: string;
  settings?: StoreSettings;
};

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug ?? row.id,
    price: toNumber(row.price),
    description: row.description ?? "",
    category: row.category ?? "General",
    imageUrl: row.image_url,
    stock: row.stock,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function mapOrder(row: OrderRow): Order {
  const relatedProduct = Array.isArray(row.product)
    ? row.product[0] ?? null
    : row.product;

  return {
    id: row.id,
    buyerName: row.buyer_name,
    buyerWa: row.buyer_wa,
    totalPrice: toNumber(row.total_price),
    status: row.status,
    proofImgUrl: row.proof_img_url,
    paymentNote: row.payment_note,
    adminNote: row.admin_note,
    paymentConfirmedAt: row.payment_confirmed_at,
    paidAt: row.paid_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    product: relatedProduct ? mapProduct(relatedProduct) : mockProducts[0],
  };
}

function normalizeTextListValue(
  value: unknown,
  fallback: string[],
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return fallback.map((fallbackItem, index) => {
    const candidate = value[index];
    return typeof candidate === "string" && candidate.trim()
      ? candidate.trim()
      : fallbackItem;
  });
}

function normalizeWorkflowStepsValue(
  value: unknown,
  fallback: StoreWorkflowStep[],
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return fallback.map((fallbackStep, index) => {
    const candidate = value[index];

    if (!candidate || typeof candidate !== "object") {
      return fallbackStep;
    }

    const title =
      "title" in candidate && typeof candidate.title === "string"
        ? candidate.title.trim()
        : "";
    const description =
      "description" in candidate && typeof candidate.description === "string"
        ? candidate.description.trim()
        : "";

    return {
      title: title || fallbackStep.title,
      description: description || fallbackStep.description,
    };
  });
}

function mapStoreSettings(row: StoreSettingsRow): StoreSettings {
  return {
    id: row.id,
    key: row.key,
    updatedAt: row.updated_at,
    ...normalizeStoreSettingsInput({
      heroBadge: row.hero_badge ?? undefined,
      heroTitle: row.hero_title ?? undefined,
      heroDescription: row.hero_description ?? undefined,
      heroPrimaryCtaLabel: row.hero_primary_cta_label ?? undefined,
      heroSecondaryCtaLabel: row.hero_secondary_cta_label ?? undefined,
      workflowBadge: row.workflow_badge ?? undefined,
      workflowTitle: row.workflow_title ?? undefined,
      workflowDescription: row.workflow_description ?? undefined,
      workflowSteps: normalizeWorkflowStepsValue(
        row.workflow_steps,
        defaultStoreSettings.workflowSteps,
      ),
      catalogBadge: row.catalog_badge ?? undefined,
      catalogTitle: row.catalog_title ?? undefined,
      catalogDescription: row.catalog_description ?? undefined,
      stackBadge: row.stack_badge ?? undefined,
      stackHighlights: normalizeTextListValue(
        row.stack_highlights,
        defaultStoreSettings.stackHighlights,
      ),
      dashboardBadge: row.dashboard_badge ?? undefined,
      dashboardNotes: normalizeTextListValue(
        row.dashboard_notes,
        defaultStoreSettings.dashboardNotes,
      ),
      paymentDisplayLabel: row.payment_display_label ?? undefined,
      paymentQrisPayload: row.payment_qris_payload ?? undefined,
      paymentMerchantName: row.payment_merchant_name ?? undefined,
      paymentMerchantCity: row.payment_merchant_city ?? undefined,
      paymentCheckoutTitle: row.payment_checkout_title ?? undefined,
      paymentCheckoutDescription: row.payment_checkout_description ?? undefined,
      paymentInstructionLines: normalizeTextListValue(
        row.payment_instruction_lines,
        defaultStoreSettings.paymentInstructionLines,
      ),
    }),
  };
}

function toStoreSettingsRowPayload(input: StoreSettingsInput) {
  const normalized = normalizeStoreSettingsInput(input);

  return {
    key: "default",
    hero_badge: normalized.heroBadge,
    hero_title: normalized.heroTitle,
    hero_description: normalized.heroDescription,
    hero_primary_cta_label: normalized.heroPrimaryCtaLabel,
    hero_secondary_cta_label: normalized.heroSecondaryCtaLabel,
    workflow_badge: normalized.workflowBadge,
    workflow_title: normalized.workflowTitle,
    workflow_description: normalized.workflowDescription,
    workflow_steps: normalized.workflowSteps,
    catalog_badge: normalized.catalogBadge,
    catalog_title: normalized.catalogTitle,
    catalog_description: normalized.catalogDescription,
    stack_badge: normalized.stackBadge,
    stack_highlights: normalized.stackHighlights,
    dashboard_badge: normalized.dashboardBadge,
    dashboard_notes: normalized.dashboardNotes,
    payment_display_label: normalized.paymentDisplayLabel,
    payment_qris_payload: normalized.paymentQrisPayload,
    payment_merchant_name: normalized.paymentMerchantName,
    payment_merchant_city: normalized.paymentMerchantCity,
    payment_checkout_title: normalized.paymentCheckoutTitle,
    payment_checkout_description: normalized.paymentCheckoutDescription,
    payment_instruction_lines: normalized.paymentInstructionLines,
  };
}

function normalizeProductInput(input: ProductDraft): ProductDraft {
  const title = input.title.trim();
  const category = input.category.trim() || "General";
  const description = input.description.trim();
  const slugSource = input.slug.trim() || title;
  const normalizedSlug = slugify(slugSource);

  return {
    title,
    slug: normalizedSlug,
    price: Math.max(0, Math.round(input.price)),
    description,
    category,
    imageUrl: input.imageUrl?.trim() || null,
    stock: Math.max(0, Math.floor(input.stock)),
    isActive: input.isActive,
  };
}

function toProductRowPayload(input: ProductDraft) {
  const normalized = normalizeProductInput(input);

  return {
    title: normalized.title,
    slug: normalized.slug,
    price: normalized.price,
    description: normalized.description,
    category: normalized.category,
    image_url: normalized.imageUrl,
    stock: normalized.stock,
    is_active: normalized.isActive,
  };
}

function getProductErrorMessage(message: string | undefined, fallback: string) {
  if (!message) {
    return fallback;
  }

  if (
    message.includes("duplicate key") ||
    message.includes("products_slug_key") ||
    message.includes("duplicate")
  ) {
    return "Slug produk sudah dipakai. Ganti slug dengan nama yang lebih unik.";
  }

  if (
    message.includes("orders_product_id_fkey") ||
    message.includes("violates foreign key constraint")
  ) {
    return "Produk yang sudah dipakai di order tidak bisa dihapus.";
  }

  return fallback;
}

function isMissingStoreSettingsTableError(message: string | undefined) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();

  return (
    normalized.includes("store_settings") &&
    (normalized.includes("schema cache") ||
      normalized.includes("does not exist") ||
      normalized.includes("relation"))
  );
}

function getStoreSettingsTableMessage() {
  return "Table store_settings belum ada. Jalankan schema.sql terbaru di Supabase SQL Editor.";
}

function hasConflictingMockSlug(slug: string, excludedProductId?: string) {
  return mockProducts.some(
    (product) => product.slug === slug && product.id !== excludedProductId,
  );
}

async function resolveProofImageUrl(path: string | null) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(path, 60 * 60 * 6);

  if (error) {
    console.error("Failed to create signed URL for proof image", error.message);
    return null;
  }

  return data.signedUrl;
}

export async function getStoreSettings() {
  if (!hasPublicSupabaseEnv()) {
    return mockStoreSettings;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return mockStoreSettings;
  }

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("key", "default")
    .maybeSingle();

  if (error || !data) {
    if (error && !isMissingStoreSettingsTableError(error.message)) {
      console.error("Failed to fetch storefront settings", error.message);
    }

    return mockStoreSettings;
  }

  return mapStoreSettings(data as StoreSettingsRow);
}

export async function getAdminStoreSettings() {
  if (!hasServiceRoleSupabaseEnv()) {
    return getStoreSettings();
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return getStoreSettings();
  }

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("key", "default")
    .maybeSingle();

  if (error || !data) {
    if (error && !isMissingStoreSettingsTableError(error.message)) {
      console.error("Failed to fetch admin store settings", error.message);
    }

    return mockStoreSettings;
  }

  return mapStoreSettings(data as StoreSettingsRow);
}

export async function updateStoreSettings(
  input: Partial<StoreSettingsInput>,
): Promise<StoreSettingsMutationResult> {
  const currentSettings = hasServiceRoleSupabaseEnv()
    ? await getAdminStoreSettings()
    : mockStoreSettings;
  const nextInput = normalizeStoreSettingsInput({
    ...extractStoreSettingsInput(currentSettings),
    ...input,
  });

  if (!hasServiceRoleSupabaseEnv()) {
    return {
      ok: true,
      mode: "mock",
      settings: updateMockStoreSettings(nextInput),
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: true,
      mode: "mock",
      settings: updateMockStoreSettings(nextInput),
    };
  }

  const { data, error } = await supabase
    .from("store_settings")
    .upsert(toStoreSettingsRowPayload(nextInput), {
      onConflict: "key",
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to update store settings", error.message);
    }

    return {
      ok: false,
      mode: "live",
      message: isMissingStoreSettingsTableError(error?.message)
        ? getStoreSettingsTableMessage()
        : "Pengaturan storefront atau pembayaran gagal disimpan. Coba lagi sebentar.",
    };
  }

  return {
    ok: true,
    mode: "live",
    settings: mapStoreSettings(data as StoreSettingsRow),
  };
}

export async function getCatalogProducts() {
  if (!hasPublicSupabaseEnv()) {
    return mockProducts.filter((product) => product.isActive);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return mockProducts.filter((product) => product.isActive);
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch catalog products", error?.message);
    return mockProducts.filter((product) => product.isActive);
  }

  return (data as ProductRow[]).map(mapProduct);
}

export async function getAdminProducts() {
  if (!hasServiceRoleSupabaseEnv()) {
    return mockProducts;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return mockProducts;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch admin products", error?.message);
    return mockProducts;
  }

  return (data as ProductRow[]).map(mapProduct);
}

export async function createProduct(input: ProductDraft): Promise<ProductMutationResult> {
  const normalized = normalizeProductInput(input);

  if (!normalized.title || !normalized.slug) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: "Judul dan slug produk wajib diisi.",
    };
  }

  if (!hasServiceRoleSupabaseEnv()) {
    if (hasConflictingMockSlug(normalized.slug)) {
      return {
        ok: false,
        mode: "mock",
        message: "Slug produk sudah dipakai. Ganti slug dengan nama yang lebih unik.",
      };
    }

    return {
      ok: true,
      mode: "mock",
      product: createMockProduct(normalized),
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    if (hasConflictingMockSlug(normalized.slug)) {
      return {
        ok: false,
        mode: "mock",
        message: "Slug produk sudah dipakai. Ganti slug dengan nama yang lebih unik.",
      };
    }

    return {
      ok: true,
      mode: "mock",
      product: createMockProduct(normalized),
    };
  }

  const { data, error } = await supabase
    .from("products")
    .insert(toProductRowPayload(normalized))
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to create product", error?.message);
    return {
      ok: false,
      mode: "live",
      message: getProductErrorMessage(
        error?.message,
        "Produk gagal ditambahkan. Coba lagi sebentar.",
      ),
    };
  }

  return {
    ok: true,
    mode: "live",
    product: mapProduct(data as ProductRow),
  };
}

export async function updateProduct(
  productId: string,
  input: ProductDraft,
): Promise<ProductMutationResult> {
  const normalized = normalizeProductInput(input);

  if (!normalized.title || !normalized.slug) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: "Judul dan slug produk wajib diisi.",
    };
  }

  const existingMockProduct = mockProducts.find((product) => product.id === productId);

  if (!hasServiceRoleSupabaseEnv()) {
    if (hasConflictingMockSlug(normalized.slug, productId)) {
      return {
        ok: false,
        mode: "mock",
        previousSlug: existingMockProduct?.slug ?? null,
        message: "Slug produk sudah dipakai. Ganti slug dengan nama yang lebih unik.",
      };
    }

    const product = updateMockProduct(productId, normalized);

    return {
      ok: Boolean(product),
      mode: "mock",
      product,
      previousSlug: existingMockProduct?.slug ?? null,
      message: existingMockProduct ? undefined : "Produk tidak ditemukan.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    if (hasConflictingMockSlug(normalized.slug, productId)) {
      return {
        ok: false,
        mode: "mock",
        previousSlug: existingMockProduct?.slug ?? null,
        message: "Slug produk sudah dipakai. Ganti slug dengan nama yang lebih unik.",
      };
    }

    const product = updateMockProduct(productId, normalized);

    return {
      ok: Boolean(product),
      mode: "mock",
      product,
      previousSlug: existingMockProduct?.slug ?? null,
      message: existingMockProduct ? undefined : "Produk tidak ditemukan.",
    };
  }

  const { data: previousData, error: previousError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  if (previousError) {
    console.error("Failed to fetch previous product before update", previousError.message);
  }

  const { data, error } = await supabase
    .from("products")
    .update(toProductRowPayload(normalized))
    .eq("id", productId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update product", error?.message);
    return {
      ok: false,
      mode: "live",
      previousSlug: previousData?.slug ?? null,
      message: getProductErrorMessage(
        error?.message,
        "Produk gagal diperbarui. Coba lagi sebentar.",
      ),
    };
  }

  return {
    ok: true,
    mode: "live",
    product: mapProduct(data as ProductRow),
    previousSlug: previousData?.slug ?? null,
  };
}

export async function setProductActive(
  productId: string,
  isActive: boolean,
): Promise<ProductMutationResult> {
  const existingMockProduct = mockProducts.find((product) => product.id === productId);

  if (!hasServiceRoleSupabaseEnv()) {
    const product = setMockProductActive(productId, isActive);

    return {
      ok: Boolean(product),
      mode: "mock",
      product,
      previousSlug: existingMockProduct?.slug ?? null,
      message: existingMockProduct ? undefined : "Produk tidak ditemukan.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const product = setMockProductActive(productId, isActive);

    return {
      ok: Boolean(product),
      mode: "mock",
      product,
      previousSlug: existingMockProduct?.slug ?? null,
      message: existingMockProduct ? undefined : "Produk tidak ditemukan.",
    };
  }

  const { data: previousData, error: previousError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  if (previousError) {
    console.error(
      "Failed to fetch previous product before status update",
      previousError.message,
    );
  }

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to toggle product activity", error?.message);
    return {
      ok: false,
      mode: "live",
      previousSlug: previousData?.slug ?? null,
      message: "Status produk gagal diubah. Coba lagi sebentar.",
    };
  }

  return {
    ok: true,
    mode: "live",
    product: mapProduct(data as ProductRow),
    previousSlug: previousData?.slug ?? null,
  };
}

export async function deleteProduct(productId: string): Promise<ProductMutationResult> {
  const existingMockProduct = mockProducts.find((product) => product.id === productId);

  if (!hasServiceRoleSupabaseEnv()) {
    const product = deleteMockProduct(productId);

    return {
      ok: Boolean(product),
      mode: "mock",
      previousSlug: existingMockProduct?.slug ?? null,
      message: existingMockProduct ? undefined : "Produk tidak ditemukan.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const product = deleteMockProduct(productId);

    return {
      ok: Boolean(product),
      mode: "mock",
      previousSlug: existingMockProduct?.slug ?? null,
      message: existingMockProduct ? undefined : "Produk tidak ditemukan.",
    };
  }

  const { data: previousData, error: previousError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  if (previousError) {
    console.error("Failed to fetch previous product before delete", previousError.message);
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Failed to delete product", error.message);
    return {
      ok: false,
      mode: "live",
      previousSlug: previousData?.slug ?? null,
      message: getProductErrorMessage(
        error.message,
        "Produk gagal dihapus. Coba lagi sebentar.",
      ),
    };
  }

  return {
    ok: true,
    mode: "live",
    previousSlug: previousData?.slug ?? null,
  };
}

export async function getProductBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const mockProduct = mockProducts.find((product) => product.slug === normalizedSlug);

  if (!hasPublicSupabaseEnv()) {
    return mockProduct ?? null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return mockProduct ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch product by slug", error.message);
    return mockProduct ?? null;
  }

  return data ? mapProduct(data as ProductRow) : mockProduct ?? null;
}

export async function getCheckoutOrder(orderId: string) {
  if (!hasServiceRoleSupabaseEnv()) {
    return mockOrders.find((order) => order.id === orderId) ?? null;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return mockOrders.find((order) => order.id === orderId) ?? null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, buyer_name, buyer_wa, total_price, status, proof_img_url, payment_note, admin_note, payment_confirmed_at, paid_at, completed_at, cancelled_at, created_at, product:products!orders_product_id_fkey(*)",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to fetch checkout order", error?.message);
    return mockOrders.find((order) => order.id === orderId) ?? null;
  }

  const order = mapOrder(data as OrderRow);
  order.proofImgUrl = await resolveProofImageUrl(order.proofImgUrl);
  return order;
}

export async function getAdminOrders() {
  if (!hasServiceRoleSupabaseEnv()) {
    return mockOrders;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return mockOrders;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, buyer_name, buyer_wa, total_price, status, proof_img_url, payment_note, admin_note, payment_confirmed_at, paid_at, completed_at, cancelled_at, created_at, product:products!orders_product_id_fkey(*)",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch admin orders", error?.message);
    return mockOrders;
  }

  const orders = await Promise.all(
    (data as OrderRow[]).map(async (row) => {
      const order = mapOrder(row);
      order.proofImgUrl = await resolveProofImageUrl(order.proofImgUrl);
      return order;
    }),
  );

  return orders;
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
  if (!hasServiceRoleSupabaseEnv()) {
    return {
      ok: Boolean(updateMockOrderStatus(orderId, nextStatus)),
      mode: "mock" as const,
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: Boolean(updateMockOrderStatus(orderId, nextStatus)),
      mode: "mock" as const,
    };
  }

  const payload = getOrderStatusUpdatePayload(nextStatus);
  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);

  if (error) {
    console.error("Failed to update order status", error.message);
    return {
      ok: false,
      mode: "live" as const,
    };
  }

  return {
    ok: true,
    mode: "live" as const,
  };
}
