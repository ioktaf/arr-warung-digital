import { getOrderStatusUpdatePayload } from "@/lib/order-status";
import { productSeedList } from "@/lib/product-seed";
import { defaultStoreSettings } from "@/lib/store-settings";
import type {
  Order,
  OrderStatus,
  Product,
  ProductDraft,
  StoreSettings,
  StoreSettingsInput,
} from "@/types/domain";

const now = new Date();

export const mockProducts: Product[] = productSeedList.map((product, index) => ({
  id: `mock-product-${String(index + 1).padStart(2, "0")}`,
  title: product.title,
  slug: product.slug,
  price: product.price,
  description: product.description,
  category: product.category,
  imageUrl: null,
  stock: product.stock,
  isActive: true,
  createdAt: new Date(now.getTime() - index * 1000 * 60 * 30).toISOString(),
}));

function getMockProduct(slug: string) {
  return mockProducts.find((product) => product.slug === slug) ?? mockProducts[0];
}

export const mockOrders: Order[] = [
  {
    id: "d9b6ceba-1f4e-4f24-a1b1-9216a8613386",
    buyerName: "Budi",
    buyerWa: "081234567890",
    totalPrice: 15000,
    status: "awaiting_verification",
    proofImgUrl: null,
    paymentNote: "Transfer dari SeaBank a.n. Budi jam 19:12",
    adminNote: null,
    paymentConfirmedAt: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
    paidAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: new Date(now.getTime() - 1000 * 60 * 16).toISOString(),
    product: getMockProduct("canva-pro-1-bulan"),
  },
  {
    id: "a0cf5826-97d1-40f0-a7f6-fca9c0540c8b",
    buyerName: "Sari",
    buyerWa: "089500001122",
    totalPrice: 35000,
    status: "paid",
    proofImgUrl: null,
    paymentNote: "QRIS BCA",
    adminNote: "Tinggal kirim profile Netflix",
    paymentConfirmedAt: new Date(now.getTime() - 1000 * 60 * 42).toISOString(),
    paidAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    completedAt: null,
    cancelledAt: null,
    createdAt: new Date(now.getTime() - 1000 * 60 * 48).toISOString(),
    product: getMockProduct("netflix-premium-1-profil"),
  },
  {
    id: "f26857d2-1f50-4b70-b670-2771b6d1721d",
    buyerName: "Rizky",
    buyerWa: "087700112233",
    totalPrice: 89000,
    status: "pending",
    proofImgUrl: null,
    paymentNote: null,
    adminNote: null,
    paymentConfirmedAt: null,
    paidAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
    product: getMockProduct("chatgpt-business-1-bulan-team-invite"),
  },
];

export const mockStoreSettings: StoreSettings = {
  ...defaultStoreSettings,
};

export function updateMockOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const order = mockOrders.find((item) => item.id === orderId);

  if (!order) {
    return null;
  }

  const payload = getOrderStatusUpdatePayload(nextStatus);

  order.status = nextStatus;

  if ("payment_confirmed_at" in payload) {
    order.paymentConfirmedAt = payload.payment_confirmed_at ?? null;
  }

  if ("paid_at" in payload) {
    order.paidAt = payload.paid_at ?? null;
  }

  if ("completed_at" in payload) {
    order.completedAt = payload.completed_at ?? null;
  }

  if ("cancelled_at" in payload) {
    order.cancelledAt = payload.cancelled_at ?? null;
  }

  return order;
}

export function createMockProduct(input: ProductDraft) {
  const product: Product = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  mockProducts.unshift(product);
  return product;
}

export function updateMockProduct(productId: string, input: ProductDraft) {
  const product = mockProducts.find((item) => item.id === productId);

  if (!product) {
    return null;
  }

  product.title = input.title;
  product.slug = input.slug;
  product.price = input.price;
  product.description = input.description;
  product.category = input.category;
  product.imageUrl = input.imageUrl;
  product.stock = input.stock;
  product.isActive = input.isActive;

  return product;
}

export function setMockProductActive(productId: string, isActive: boolean) {
  const product = mockProducts.find((item) => item.id === productId);

  if (!product) {
    return null;
  }

  product.isActive = isActive;
  return product;
}

export function deleteMockProduct(productId: string) {
  const index = mockProducts.findIndex((item) => item.id === productId);

  if (index === -1) {
    return null;
  }

  const [product] = mockProducts.splice(index, 1);
  return product ?? null;
}

export function updateMockStoreSettings(input: StoreSettingsInput) {
  mockStoreSettings.heroBadge = input.heroBadge;
  mockStoreSettings.heroTitle = input.heroTitle;
  mockStoreSettings.heroDescription = input.heroDescription;
  mockStoreSettings.heroPrimaryCtaLabel = input.heroPrimaryCtaLabel;
  mockStoreSettings.heroSecondaryCtaLabel = input.heroSecondaryCtaLabel;
  mockStoreSettings.workflowBadge = input.workflowBadge;
  mockStoreSettings.workflowTitle = input.workflowTitle;
  mockStoreSettings.workflowDescription = input.workflowDescription;
  mockStoreSettings.workflowSteps = input.workflowSteps;
  mockStoreSettings.catalogBadge = input.catalogBadge;
  mockStoreSettings.catalogTitle = input.catalogTitle;
  mockStoreSettings.catalogDescription = input.catalogDescription;
  mockStoreSettings.stackBadge = input.stackBadge;
  mockStoreSettings.stackHighlights = input.stackHighlights;
  mockStoreSettings.dashboardBadge = input.dashboardBadge;
  mockStoreSettings.dashboardNotes = input.dashboardNotes;
  mockStoreSettings.paymentDisplayLabel = input.paymentDisplayLabel;
  mockStoreSettings.paymentQrisPayload = input.paymentQrisPayload;
  mockStoreSettings.paymentMerchantName = input.paymentMerchantName;
  mockStoreSettings.paymentMerchantCity = input.paymentMerchantCity;
  mockStoreSettings.paymentCheckoutTitle = input.paymentCheckoutTitle;
  mockStoreSettings.paymentCheckoutDescription = input.paymentCheckoutDescription;
  mockStoreSettings.paymentInstructionLines = input.paymentInstructionLines;
  mockStoreSettings.updatedAt = new Date().toISOString();

  return mockStoreSettings;
}
