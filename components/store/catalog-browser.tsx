"use client";

import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

type CatalogBrowserProps = {
  products: Product[];
};

export function CatalogBrowser({ products }: CatalogBrowserProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const deferredQuery = useDeferredValue(query);

  const categories = [
    "Semua",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "Semua" || product.category === activeCategory;
    const searchable = `${product.title} ${product.category} ${product.description}`.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || searchable.includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge tone="accent">Filter Katalog</Badge>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Pakai filter kategori atau cari nama produk biar katalog yang
              panjang tetap cepat dipindai.
            </p>
          </div>

          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari produk, contoh: Canva, Perplexity, Netflix"
              className="w-full rounded-full border border-line bg-white/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category === activeCategory;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-brand text-white"
                    : "border border-line bg-white/70 text-foreground hover:bg-white",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Menampilkan <span className="font-semibold text-foreground">{filteredProducts.length}</span>
          {" "}dari {products.length} produk.
        </p>
        {activeCategory !== "Semua" ? (
          <Badge tone="brand">{activeCategory}</Badge>
        ) : null}
      </div>

      {filteredProducts.length ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-lg font-semibold">Produk tidak ditemukan.</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Coba ganti kata kunci atau balik ke kategori lain.
          </p>
        </Card>
      )}
    </div>
  );
}
