import Link from "next/link";
import { LayoutDashboard, Package2, Store } from "lucide-react";

const links = [
  { href: "/admin", label: "Orders", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package2 },
  { href: "/", label: "Storefront", icon: Store },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef3e6_0%,#f6f1e8_100%)]">
      <header className="border-b border-line bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted">
              Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-black">ARR Warung Digital</h1>
          </div>

          <nav className="flex flex-wrap gap-3">
            {links.map((link) => {
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
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
