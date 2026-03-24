export const ORDER_STATUSES = [
  "pending",
  "awaiting_verification",
  "paid",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PROMO_DISCOUNT_TYPES = ["fixed", "percent"] as const;

export type PromoDiscountType = (typeof PROMO_DISCOUNT_TYPES)[number];

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

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  category: string;
  unitPrice: number;
  stock: number;
  quantity: number;
};

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
  product: Product;
};

export type Order = {
  id: string;
  buyerName: string;
  buyerWa: string;
  uniqueCode: number;
  subtotalPrice: number;
  promoCode: string | null;
  promoDiscountAmount: number;
  totalPrice: number;
  totalQuantity: number;
  status: OrderStatus;
  proofImgUrl: string | null;
  paymentNote: string | null;
  adminNote: string | null;
  paymentConfirmedAt: string | null;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  items: OrderItem[];
  product: Product;
};

export type PromoCodeDraft = {
  code: string;
  label: string;
  description: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minimumSubtotal: number;
  maxDiscount: number | null;
  isActive: boolean;
};

export type PromoCode = PromoCodeDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type StoreWorkflowStep = {
  title: string;
  description: string;
};

export type StoreSettingsInput = {
  brandName: string;
  brandCompactName: string;
  brandLogoUrl: string;
  brandTagline: string;
  headerStatusBadge: string;
  headerNavLabels: string[];
  contactWhatsappNumber: string;
  contactWhatsappLabel: string;
  footerDescription: string;
  footerLinkLabels: string[];
  demoBannerText: string;
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
  catalogStatusLabel: string;
  catalogStatusDescription: string;
  workflowStatusLabel: string;
  workflowStatusDescription: string;
  operationsStatusLabel: string;
  operationsStatusTitle: string;
  operationsStatusDescription: string;
  checkoutEyebrow: string;
  checkoutIntroDescription: string;
  buyerFormTitle: string;
  buyerFormDescription: string;
  buyerReadyTitle: string;
  buyerReadyDescription: string;
  paymentDisplayLabel: string;
  paymentQrisPayload: string;
  paymentMerchantName: string;
  paymentMerchantCity: string;
  paymentCheckoutTitle: string;
  paymentCheckoutDescription: string;
  paymentInstructionLines: string[];
  paymentConfirmTitle: string;
  paymentConfirmDescription: string;
  paymentSuccessMessage: string;
  paymentNoteLabel: string;
  proofUploadLabel: string;
  paymentConfirmButtonLabel: string;
  checkoutContinueButtonLabel: string;
  trackerTitle: string;
  operationalNotesTitle: string;
  operationalNotesDescription: string;
  operationalNotesLines: string[];
  orderSnapshotTitle: string;
};

export type StoreSettings = StoreSettingsInput & {
  id: string;
  key: string;
  updatedAt: string;
};
