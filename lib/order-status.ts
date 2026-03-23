import type { OrderStatus } from "@/types/domain";

export type OrderActionConfig = {
  nextStatus: OrderStatus;
  label: string;
  pendingLabel: string;
  tone: "neutral" | "brand" | "accent" | "success" | "danger";
};

const statusActions: Record<OrderStatus, OrderActionConfig[]> = {
  pending: [
    {
      nextStatus: "awaiting_verification",
      label: "Naikkan ke Verify",
      pendingLabel: "Mengubah...",
      tone: "accent",
    },
    {
      nextStatus: "cancelled",
      label: "Batalkan",
      pendingLabel: "Membatalkan...",
      tone: "danger",
    },
  ],
  awaiting_verification: [
    {
      nextStatus: "paid",
      label: "Approve as Paid",
      pendingLabel: "Meng-approve...",
      tone: "brand",
    },
    {
      nextStatus: "cancelled",
      label: "Cancel Order",
      pendingLabel: "Membatalkan...",
      tone: "danger",
    },
  ],
  paid: [
    {
      nextStatus: "completed",
      label: "Mark Completed",
      pendingLabel: "Menutup order...",
      tone: "success",
    },
    {
      nextStatus: "awaiting_verification",
      label: "Balik ke Verify",
      pendingLabel: "Mengubah...",
      tone: "accent",
    },
  ],
  completed: [
    {
      nextStatus: "paid",
      label: "Reopen to Paid",
      pendingLabel: "Membuka ulang...",
      tone: "brand",
    },
  ],
  cancelled: [
    {
      nextStatus: "pending",
      label: "Reopen to Pending",
      pendingLabel: "Membuka ulang...",
      tone: "neutral",
    },
  ],
};

export function getOrderStatusActions(status: OrderStatus) {
  return statusActions[status];
}

export function getOrderStatusUpdatePayload(nextStatus: OrderStatus) {
  const timestamp = new Date().toISOString();

  switch (nextStatus) {
    case "pending":
      return {
        status: nextStatus,
        payment_confirmed_at: null,
        paid_at: null,
        completed_at: null,
        cancelled_at: null,
      };
    case "awaiting_verification":
      return {
        status: nextStatus,
        payment_confirmed_at: timestamp,
        paid_at: null,
        completed_at: null,
        cancelled_at: null,
      };
    case "paid":
      return {
        status: nextStatus,
        paid_at: timestamp,
        completed_at: null,
        cancelled_at: null,
      };
    case "completed":
      return {
        status: nextStatus,
        completed_at: timestamp,
        cancelled_at: null,
      };
    case "cancelled":
      return {
        status: nextStatus,
        completed_at: null,
        cancelled_at: timestamp,
      };
  }
}
