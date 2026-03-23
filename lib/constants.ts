export const siteConfig = {
  name: "ARR Warung Digital",
  description:
    "Warung digital semi-auto untuk jualan akun, voucher, dan produk instan tanpa bikin buyer repot login.",
};

export const semiAutoSteps = [
  {
    title: "Buyer pilih produk",
    description:
      "Guest checkout cukup isi nama dan WhatsApp, lalu sistem arahkan ke halaman pembayaran QRIS.",
  },
  {
    title: "Buyer klik konfirmasi bayar",
    description:
      "Bukti transfer opsional, tapi tombol konfirmasi bikin admin tahu ada transaksi yang perlu dicocokkan.",
  },
  {
    title: "Admin verifikasi mutasi",
    description:
      "Dashboard menyorot order Awaiting Verification supaya admin tinggal cek mutasi bank atau e-wallet.",
  },
  {
    title: "Admin kirim akun",
    description:
      "Setelah status Paid, admin bisa kirim akun via WhatsApp dan tutup order ke Completed.",
  },
] as const;

export const stackHighlights = [
  "Next.js App Router untuk storefront dan dashboard admin",
  "Supabase PostgreSQL + Storage untuk order dan bukti bayar",
  "Realtime-ready untuk notif order masuk",
  "Deploy ringan di Vercel dengan env Supabase",
] as const;

export const dashboardNotes = [
  "Order baru masuk ke Pending saat buyer submit data checkout.",
  "Saat buyer klik konfirmasi bayar, order naik ke Awaiting Verification.",
  "Admin cek mutasi manual, lalu update status ke Paid dan Completed.",
] as const;
