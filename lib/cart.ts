import type { CartItem, Product } from "@/types/domain";

export const CART_STORAGE_KEY = "arr-warung-digital-cart";
export const CART_QUERY_KEY = "cart";

export type CartLinePayload = {
  productId: string;
  quantity: number;
};

export function clampCartQuantity(value: number, maxStock: number) {
  const safeMax = Math.max(0, Math.floor(maxStock));
  const safeValue = Number.isFinite(value) ? Math.floor(value) : 1;

  if (safeMax === 0) {
    return 0;
  }

  return Math.min(Math.max(safeValue, 1), safeMax);
}

export function createCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    category: product.category,
    unitPrice: product.price,
    stock: product.stock,
    quantity: clampCartQuantity(quantity, product.stock),
  };
}

export function sanitizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<CartItem>;

  if (
    typeof candidate.productId !== "string" ||
    typeof candidate.slug !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.category !== "string" ||
    typeof candidate.unitPrice !== "number" ||
    typeof candidate.stock !== "number" ||
    typeof candidate.quantity !== "number"
  ) {
    return null;
  }

  const quantity = clampCartQuantity(candidate.quantity, candidate.stock);

  if (quantity <= 0) {
    return null;
  }

  return {
    productId: candidate.productId,
    slug: candidate.slug,
    title: candidate.title,
    category: candidate.category,
    unitPrice: Math.max(0, Math.round(candidate.unitPrice)),
    stock: Math.max(0, Math.floor(candidate.stock)),
    quantity,
  };
}

export function parseCartItemsPayload(payload: string | undefined) {
  if (!payload) {
    return [];
  }

  try {
    const parsed = JSON.parse(payload) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const candidate = item as Partial<CartLinePayload>;

      if (
        typeof candidate.productId !== "string" ||
        typeof candidate.quantity !== "number"
      ) {
        return [];
      }

      return [
        {
          productId: candidate.productId,
          quantity: Math.max(1, Math.floor(candidate.quantity)),
        },
      ];
    });
  } catch {
    return [];
  }
}

export function serializeCartItemsPayload(items: Pick<CartItem, "productId" | "quantity">[]) {
  return JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      quantity: Math.max(1, Math.floor(item.quantity)),
    })),
  );
}
