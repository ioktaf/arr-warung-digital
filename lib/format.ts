import type { OrderStatus } from "@/types/domain";

type StatusMeta = {
  label: string;
  description: string;
  tone: "neutral" | "brand" | "accent" | "success" | "danger";
};

const statusMap: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    description: "Buyer baru isi data checkout, belum konfirmasi pembayaran.",
    tone: "neutral",
  },
  awaiting_verification: {
    label: "Awaiting Verification",
    description: "Buyer mengaku sudah bayar, admin perlu cek mutasi sekarang.",
    tone: "accent",
  },
  paid: {
    label: "Paid",
    description: "Dana sudah cocok, tinggal kirim akun ke buyer.",
    tone: "brand",
  },
  completed: {
    label: "Completed",
    description: "Produk sudah dikirim dan order selesai.",
    tone: "success",
  },
  cancelled: {
    label: "Cancelled",
    description: "Order dibatalkan atau ada kendala pembayaran.",
    tone: "danger",
  },
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getOrderStatusMeta(status: OrderStatus) {
  return statusMap[status];
}
