export const ORDER_STATUSES = [
  "pending",
  "awaiting_verification",
  "paid",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
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
