"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Minus, Package2, Plus, ShoppingCart } from "lucide-react";

import { useCart } from "@/components/store/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/domain";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const maxQuantity = Math.max(0, product.stock);
  const [quantity, setQuantity] = useState(1);
  const safeQuantity = maxQuantity > 0 ? Math.min(Math.max(quantity, 1), maxQuantity) : 0;
  const isOutOfStock = product.stock <= 0;

  function updateQuantity(nextQuantity: number) {
    if (maxQuantity === 0) {
      setQuantity(0);
      return;
    }

    setQuantity(Math.min(Math.max(nextQuantity, 1), maxQuantity));
  }

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

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Harga / seat</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {formatCurrency(product.price)}
            </p>
            <p className="text-sm text-muted">
              Stok aktif: {product.stock} {product.stock === 0 ? "(habis)" : ""}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-2 py-2">
            <button
              type="button"
              onClick={() => updateQuantity(safeQuantity - 1)}
              className="rounded-full p-2 transition hover:bg-muted-soft"
              disabled={isOutOfStock}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-semibold">
              {safeQuantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(safeQuantity + 1)}
              className="rounded-full p-2 transition hover:bg-muted-soft"
              disabled={isOutOfStock}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-[22px] border border-line bg-white/60 p-4">
          <p className="text-sm text-muted">Subtotal seat dipilih</p>
          <p className="mt-1 text-2xl font-black">
            {formatCurrency(product.price * safeQuantity)}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => addItem(product, safeQuantity)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingCart className="h-4 w-4" />
          Tambah ke Keranjang
        </button>

        <Link
          href={`/checkout/${product.slug}?quantity=${safeQuantity}`}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
            isOutOfStock
              ? "pointer-events-none bg-muted-soft text-muted"
              : "bg-brand text-white hover:bg-brand-strong"
          }`}
        >
          Checkout
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
