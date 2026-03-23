export const ORDER_STATUSES = [
  "pending",
  "awaiting_verification",
  "paid",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type ProductDraft = {
  title: string;
  slug: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
};

export type Product = ProductDraft & {
  id: string;
  createdAt: string;
};

export type Order = {
  id: string;
  buyerName: string;
  buyerWa: string;
  totalPrice: number;
  status: OrderStatus;
  proofImgUrl: string | null;
  paymentNote: string | null;
  adminNote: string | null;
  paymentConfirmedAt: string | null;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  product: Product;
};

export type StoreWorkflowStep = {
  title: string;
  description: string;
};

export type StoreSettingsInput = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;
  workflowBadge: string;
  workflowTitle: string;
  workflowDescription: string;
  workflowSteps: StoreWorkflowStep[];
  catalogBadge: string;
  catalogTitle: string;
  catalogDescription: string;
  stackBadge: string;
  stackHighlights: string[];
  dashboardBadge: string;
  dashboardNotes: string[];
  paymentDisplayLabel: string;
  paymentQrisPayload: string;
  paymentMerchantName: string;
  paymentMerchantCity: string;
  paymentCheckoutTitle: string;
  paymentCheckoutDescription: string;
  paymentInstructionLines: string[];
};

export type StoreSettings = StoreSettingsInput & {
  id: string;
  key: string;
  updatedAt: string;
};
