import type { Metadata } from "next";

import { getStoreSettings } from "@/lib/data";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const description =
    settings.heroDescription ===
    "Buyer bisa checkout tanpa login, admin dapat notifikasi order yang perlu dicek, dan semua fondasinya sudah disiapkan buat nyambung ke Supabase."
      ? "Pilih produk digital, atur jumlah seat, bayar via QRIS, lalu lacak status order dengan mudah."
      : settings.heroDescription;

  return {
    title: {
      default: settings.brandName,
      template: `%s | ${settings.brandName}`,
    },
    description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
