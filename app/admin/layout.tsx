import Link from "next/link";
import { LayoutDashboard, Package2, Settings2, Store } from "lucide-react";

import { logoutAdminAction } from "@/app/admin/login/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const adminLinks = [
  { href: "/admin", label: "Orders", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package2 },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
  { href: "/", label: "Storefront", icon: Store },
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef3e6_0%,#f6f1e8_100%)]">
      <header className="border-b border-line bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Badge tone={isAuthenticated ? "brand" : "accent"}>
              {isAuthenticated ? "Protected Admin" : "Admin Login"}
            </Badge>
            <h1 className="mt-3 text-3xl font-black">ARR Warung Digital</h1>
            <p className="mt-2 text-sm leading-7 text-muted">
              {isAuthenticated
                ? "Workspace admin terkunci password untuk order board, panel produk, dan konfigurasi storefront."
                : "Masuk dengan password admin untuk membuka dashboard operasional."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                adminLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white/65 px-4 py-2 text-sm font-medium transition hover:bg-white"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })
              ) : (
                <>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white/65 px-4 py-2 text-sm font-medium transition hover:bg-white"
                  >
                    <Store className="h-4 w-4" />
                    Storefront
                  </Link>
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
                  >
                    Login Admin
                  </Link>
                </>
              )}
            </nav>

            {isAuthenticated ? (
              <form action={logoutAdminAction}>
                <SubmitButton
                  idleLabel="Logout"
                  pendingLabel="Keluar..."
                  className="inline-flex items-center gap-2 rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9d1818] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </form>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
