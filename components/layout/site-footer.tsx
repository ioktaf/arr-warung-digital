import Link from "next/link";

import { SiteBrand } from "@/components/layout/site-brand";
import type { StoreSettings } from "@/types/domain";

type SiteFooterProps = {
  settings: StoreSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  const links = [
    { href: "/", label: settings.footerLinkLabels[0] },
    { href: "/admin", label: settings.footerLinkLabels[1] },
    { href: "/checkout/canva-pro-1-bulan", label: settings.footerLinkLabels[2] },
  ];

  return (
    <footer className="border-t border-line bg-white/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3">
          <SiteBrand
            logoUrl={settings.brandLogoUrl}
            title={settings.brandName}
            compactTitle={settings.brandCompactName}
            iconClassName="h-10 w-10"
            titleClassName="font-semibold text-foreground"
            subtitleClassName="hidden"
          />
          <div>
            <p>{settings.footerDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
