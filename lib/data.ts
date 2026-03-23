import {
  createMockProduct,
  deleteMockProduct,
  mockOrders,
  mockProducts,
  setMockProductActive,
  updateMockOrderStatus,
  updateMockProduct,
} from "@/lib/mock-data";
import { getOrderStatusUpdatePayload } from "@/lib/order-status";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  hasPublicSupabaseEnv,
  hasServiceRoleSupabaseEnv,
} from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { Order, OrderStatus, Product, ProductDraft } from "@/types/domain";

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

type ProductMutationResult = {
  ok: boolean;
  mode: "live" | "mock";
  message?: string;
  product?: Product | null;
  previousSlug?: string | null;
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
