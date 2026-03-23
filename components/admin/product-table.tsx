import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/domain";

type ProductTableProps = {
  products: Product[];
};

export function ProductTable({ products }: ProductTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="bg-white/65 text-muted">
            <tr>
              <th className="px-6 py-4 font-semibold">Produk</th>
              <th className="px-6 py-4 font-semibold">Kategori</th>
              <th className="px-6 py-4 font-semibold">Harga</th>
              <th className="px-6 py-4 font-semibold">Stok</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr
                key={product.id}
                className="bg-white/35"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-foreground">{product.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                    /{product.slug}
                  </p>
                </td>
                <td className="px-6 py-4 text-muted">{product.category}</td>
                <td className="px-6 py-4 font-medium text-foreground">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 text-muted">{product.stock}</td>
                <td className="px-6 py-4">
                  <Badge tone={product.isActive ? "success" : "danger"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
