"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/store/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { serializeCartItemsPayload } from "@/lib/cart";
import { formatCurrency } from "@/lib/format";

export function CartPageClient() {
  const {
    items,
    isReady,
    itemCount,
    subtotal,
    setItemQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const checkoutHref = `/checkout/cart?cart=${encodeURIComponent(
    serializeCartItemsPayload(items),
  )}`;

  if (!isReady) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <Card>
          <p className="text-lg font-semibold">Memuat keranjang...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="accent">Keranjang Buyer</Badge>
          <h1 className="mt-3 text-4xl font-black">Atur seat sebelum checkout</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Buyer bisa kumpulkan beberapa produk sekaligus, atur jumlah seat per
            item, lalu lanjut ke satu pembayaran QRIS dengan total gabungan.
          </p>
        </div>

        {items.length ? (
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white"
          >
            Kosongkan Keranjang
          </button>
        ) : null}
      </section>

      {items.length ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.productId}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-muted">
                      {item.category}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      Harga / seat {formatCurrency(item.unitPrice)} · stok tersedia{" "}
                      {item.stock}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-white/60 p-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-2 py-2">
                    <button
                      type="button"
                      onClick={() => setItemQuantity(item.productId, item.quantity - 1)}
                      className="rounded-full p-2 transition hover:bg-muted-soft"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setItemQuantity(item.productId, item.quantity + 1)}
                      className="rounded-full p-2 transition hover:bg-muted-soft"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted">Subtotal Item</p>
                    <p className="mt-1 text-xl font-black">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="h-fit space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ringkasan Keranjang</h2>
                <p className="text-sm leading-7 text-muted">
                  Total item dan seat akan dibawa ke halaman checkout.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-line bg-white/60 p-5">
              <div>
                <p className="text-sm text-muted">Jumlah baris produk</p>
                <p className="mt-1 text-xl font-bold">{items.length} item</p>
              </div>
              <div>
                <p className="text-sm text-muted">Total seat</p>
                <p className="mt-1 text-xl font-bold">{itemCount} seat</p>
              </div>
              <div>
                <p className="text-sm text-muted">Subtotal</p>
                <p className="mt-1 text-3xl font-black">{formatCurrency(subtotal)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={checkoutHref}
                className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                Lanjut Checkout Keranjang
              </Link>
              <Link
                href="/#produk"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white"
              >
                Tambah Produk Lagi
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="mt-8 space-y-4">
          <p className="text-xl font-bold">Keranjang masih kosong.</p>
          <p className="text-sm leading-7 text-muted">
            Tambahkan produk dari katalog dulu, lalu buyer bisa pilih berapa seat
            yang mau di-checkout.
          </p>
          <div>
            <Link
              href="/#produk"
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Kembali ke Katalog
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
