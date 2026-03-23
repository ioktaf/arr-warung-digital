"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/store/cart-provider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
    >
      <ShoppingCart className="h-4 w-4" />
      Keranjang
      <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
        {itemCount}
      </span>
    </Link>
  );
}
