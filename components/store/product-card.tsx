"use client";

import Link from "next/link";
import { ArrowUpRight, Package2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/domain";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex h-full flex-col gap-6">
      <div className="grid-pattern rounded-[22px] border border-line bg-white/55 p-5">
        <div className="mb-10 flex items-start justify-between gap-4">
          <Badge>{product.category}</Badge>
          <div className="rounded-2xl bg-brand/10 p-3 text-brand">
            <Package2 className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            Produk Digital
          </p>
          <h3 className="text-2xl font-bold leading-tight">{product.title}</h3>
          <p className="text-sm leading-7 text-muted">{product.description}</p>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Harga</p>
          <p className="font-display text-3xl font-bold text-foreground">
            {formatCurrency(product.price)}
          </p>
          <p className="text-sm text-muted">Stok aktif: {product.stock}</p>
        </div>

        <Link
          href={`/checkout/${product.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Checkout
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
