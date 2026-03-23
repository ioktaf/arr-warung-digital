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
  uniqueCode: number;
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
  brandName: string;
  brandCompactName: string;
  brandLogoUrl: string;
  brandTagline: string;
  headerStatusBadge: string;
  headerNavLabels: string[];
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
