import Link from "next/link";

import { SiteBrand } from "@/components/layout/site-brand";
import { formatWhatsappHref, normalizeWhatsappNumber } from "@/lib/utils";
import type { StoreSettings } from "@/types/domain";

type SiteFooterProps = {
  settings: StoreSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  const footerDescription =
    settings.footerDescription ===
    "Fondasi MVP untuk jualan akun digital dengan verifikasi pembayaran manual yang tetap rapi."
      ? "Pilih produk, tentukan seat, bayar via QRIS, lalu tunggu admin kirim aksesmu."
      : settings.footerDescription;
  const hasWhatsappContact = Boolean(
    normalizeWhatsappNumber(settings.contactWhatsappNumber),
  );
  const contactHref = hasWhatsappContact
    ? formatWhatsappHref(settings.contactWhatsappNumber)
    : "/track";
  const [productsLabel, trackLabel, faqLabel] = settings.footerLinkLabels;
  const links = [
    { href: "/#produk", label: productsLabel || "Produk" },
    { href: "/track", label: trackLabel || "Lacak Order" },
    { href: "/#faq", label: faqLabel || "FAQ" },
  ];

  return (
    <footer className="border-t border-line bg-white/55">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex max-w-xl items-start gap-3">
          <SiteBrand
            logoUrl={settings.brandLogoUrl}
            title={settings.brandName}
            compactTitle={settings.brandCompactName}
            iconClassName="h-10 w-10"
            titleClassName="font-semibold text-foreground"
            subtitleClassName="hidden"
          />
          <div>
            <p>{footerDescription}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
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

          <Link
            href={contactHref}
            target={hasWhatsappContact ? "_blank" : undefined}
            rel={hasWhatsappContact ? "noreferrer" : undefined}
            className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            {settings.contactWhatsappLabel || "Kontak WhatsApp"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
