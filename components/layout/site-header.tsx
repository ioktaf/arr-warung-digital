import Link from "next/link";

import { SiteBrand } from "@/components/layout/site-brand";
import { Badge } from "@/components/ui/badge";
import type { StoreSettings } from "@/types/domain";

const links = [
  { href: "/#produk", label: "Produk" },
  { href: "/#cara-kerja", label: "Alur Semi-Auto" },
  { href: "/admin", label: "Dashboard Admin" },
];

type SiteHeaderProps = {
  settings: StoreSettings;
};

export function SiteHeader({ settings }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <SiteBrand
            logoUrl={settings.brandLogoUrl}
            title="ARR Warung Digital"
            compactTitle="Warung Digital"
            subtitle="Guest checkout, QRIS, manual mutation check"
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
          <Badge tone="accent">Semi-Auto</Badge>
        </nav>
      </div>
    </header>
  );
}
