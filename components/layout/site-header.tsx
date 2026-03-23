import Link from "next/link";

import { SiteBrand } from "@/components/layout/site-brand";
import { CartLink } from "@/components/store/cart-link";
import { formatWhatsappHref, normalizeWhatsappNumber } from "@/lib/utils";
import type { StoreSettings } from "@/types/domain";

type SiteHeaderProps = {
  settings: StoreSettings;
};

export function SiteHeader({ settings }: SiteHeaderProps) {
  const brandTagline =
    settings.brandTagline === "Guest checkout, QRIS, manual mutation check"
      ? "Belanja akun digital jadi lebih cepat, simpel, dan nyaman."
      : settings.brandTagline;
  const hasWhatsappContact = Boolean(
    normalizeWhatsappNumber(settings.contactWhatsappNumber),
  );
  const contactHref = hasWhatsappContact
    ? formatWhatsappHref(settings.contactWhatsappNumber)
    : "/track";
  const [productsLabel, workflowLabel, faqLabel] = settings.headerNavLabels;
  const links = [
    { href: "/#produk", label: productsLabel || "Produk" },
    { href: "/#cara-order", label: workflowLabel || "Cara Order" },
    { href: "/#faq", label: faqLabel || "FAQ" },
    { href: "/track", label: "Lacak Order" },
    {
      href: contactHref,
      label: settings.contactWhatsappLabel || "Kontak WhatsApp",
      external: hasWhatsappContact,
    },
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
            subtitle={brandTagline}
          />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-3 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-white/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <CartLink />
        </div>
      </div>

      <div className="border-t border-line/60 md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {links.map((link) => (
            <Link
              key={`mobile-${link.href}`}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="whitespace-nowrap rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/admin"
        className="sr-only"
      >
        Admin
      </Link>
    </header>
  );
}
