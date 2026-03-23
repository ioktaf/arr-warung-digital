import Link from "next/link";

import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-16">
      <Card className="w-full text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">404</p>
        <h1 className="mt-3 text-4xl font-black">Halaman tidak ditemukan</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Rute yang kamu cari belum ada atau slug produknya belum cocok dengan
          data katalog.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Kembali ke Storefront
        </Link>
      </Card>
    </div>
  );
}
