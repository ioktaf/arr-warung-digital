import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ARR Warung Digital",
    template: "%s | ARR Warung Digital",
  },
  description:
    "Katalog produk digital dengan guest checkout, QRIS, upload bukti bayar, dan dashboard admin semi-auto berbasis Next.js + Supabase.",
};

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
