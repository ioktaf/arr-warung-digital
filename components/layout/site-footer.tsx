import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-foreground">ARR Warung Digital</p>
          <p>
            Fondasi MVP untuk jualan akun digital dengan verifikasi pembayaran
            manual yang tetap rapi.
          </p>
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
