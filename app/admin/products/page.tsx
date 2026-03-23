import { Archive, Boxes, Package2 } from "lucide-react";

import { ProductTable } from "@/components/admin/product-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  const activeCount = products.filter((product) => product.isActive).length;
  const lowStockCount = products.filter((product) => product.stock <= 10).length;

  return (
    <div className="space-y-8">
      <section>
        <Badge tone="brand">Product Management</Badge>
        <h2 className="mt-3 text-4xl font-black">Inventory Snapshot</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Halaman ini jadi fondasi buat CRUD produk. Sekarang fokusnya masih
          list dan audit ringan: lihat produk aktif, harga, slug, dan stok yang
          mulai tipis.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <Boxes className="h-5 w-5 text-brand" />
            <Badge>{products.length} item</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Total Produk
          </p>
          <p className="mt-2 text-3xl font-black">{products.length}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Package2 className="h-5 w-5 text-success" />
            <Badge tone="success">{activeCount} active</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Aktif
          </p>
          <p className="mt-2 text-3xl font-black">{activeCount}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Archive className="h-5 w-5 text-accent" />
            <Badge tone="accent">{lowStockCount} low stock</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Perlu Restock
          </p>
          <p className="mt-2 text-3xl font-black">{lowStockCount}</p>
        </Card>
      </section>

      <ProductTable products={products} />
    </div>
  );
}
