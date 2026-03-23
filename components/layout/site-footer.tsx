import Link from "next/link";

import { SiteBrand } from "@/components/layout/site-brand";
import type { StoreSettings } from "@/types/domain";

type SiteFooterProps = {
  settings: StoreSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="border-t border-line bg-white/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3">
          <SiteBrand
            logoUrl={settings.brandLogoUrl}
            title="ARR Warung Digital"
            iconClassName="h-10 w-10"
            titleClassName="font-semibold text-foreground"
            subtitleClassName="hidden"
          />
          <div>
            <p>
              Fondasi MVP untuk jualan akun digital dengan verifikasi pembayaran
              manual yang tetap rapi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="transition hover:text-foreground"
          >
            Storefront
          </Link>
          <Link
            href="/admin"
            className="transition hover:text-foreground"
          >
            Admin
          </Link>
          <Link
            href="/checkout/canva-pro-1-bulan"
            className="transition hover:text-foreground"
          >
            Checkout Demo
          </Link>
        </div>
      </div>
    </footer>
  );
}
