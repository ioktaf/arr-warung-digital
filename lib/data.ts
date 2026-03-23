import { mockOrders, mockProducts, updateMockOrderStatus } from "@/lib/mock-data";
import { getOrderStatusUpdatePayload } from "@/lib/order-status";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  hasPublicSupabaseEnv,
  hasServiceRoleSupabaseEnv,
} from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, Product } from "@/types/domain";

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
