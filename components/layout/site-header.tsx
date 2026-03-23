import Link from "next/link";

import { SiteBrand } from "@/components/layout/site-brand";
import { Badge } from "@/components/ui/badge";
import type { StoreSettings } from "@/types/domain";

type SiteHeaderProps = {
  settings: StoreSettings;
};

export function SiteHeader({ settings }: SiteHeaderProps) {
  const links = [
    { href: "/#produk", label: settings.headerNavLabels[0] },
    { href: "/#cara-kerja", label: settings.headerNavLabels[1] },
    { href: "/admin", label: settings.headerNavLabels[2] },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <SiteBrand
            logoUrl={settings.brandLogoUrl}
            title={settings.brandName}
            compactTitle={settings.brandCompactName}
            subtitle={settings.brandTagline}
          />
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-white/60 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Badge tone="accent">{settings.headerStatusBadge}</Badge>
        </nav>
      </div>
    </header>
  );
}
