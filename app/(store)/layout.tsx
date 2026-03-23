import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/components/store/cart-provider";
import { getStoreSettings } from "@/lib/data";
import type { StoreSettings } from "@/types/domain";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings: StoreSettings = await getStoreSettings();

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </div>
    </CartProvider>
  );
}
