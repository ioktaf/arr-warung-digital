import type { Metadata } from "next";

import { getStoreSettings } from "@/lib/data";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: {
      default: settings.brandName,
      template: `%s | ${settings.brandName}`,
    },
    description: settings.heroDescription,
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
