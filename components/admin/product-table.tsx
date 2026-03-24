import type { ReactNode } from "react";

import {
  createProductAction,
  deleteProductAction,
  toggleProductStatusAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

const noticeToneClasses = {
  success: "border border-success/20 bg-success/10 text-success",
  danger: "border border-danger/20 bg-danger/10 text-danger",
  accent: "border border-accent/20 bg-accent/10 text-accent",
} as const;

const buttonToneClasses = {
  neutral: "border border-line bg-white/70 text-foreground hover:bg-white",
  brand: "bg-brand text-white hover:bg-brand-strong",
  accent: "bg-accent text-white hover:bg-[#c26f05]",
  danger: "bg-danger text-white hover:bg-[#9d1818]",
} as const;

type NoticeTone = keyof typeof noticeToneClasses;

type ProductTableProps = {
  products: Product[];
  notice?: string;
  noticeTone?: NoticeTone;
};

type ProductFormFieldsProps = {
  product?: Product;
};

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-2 text-sm font-medium", className)}>
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs leading-6 text-muted">{hint}</span> : null}
    </label>
  );
}

function TextInput({
  name,
  type = "text",
  defaultValue,
  placeholder,
  list,
  required,
}: {
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  list?: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      list={list}
      required={required}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
    />
  );
}

function FileInput({
  name,
  accept = "image/*",
}: {
  name: string;
  accept?: string;
}) {
  return (
    <input
      name={name}
      type="file"
      accept={accept}
      className="rounded-2xl border border-dashed border-line bg-white/75 px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-brand"
    />
  );
}

function ProductFormFields({ product }: ProductFormFieldsProps) {
  return (
    <>
      <Field label="Nama Produk">
        <TextInput
          name="title"
          defaultValue={product?.title}
          placeholder="Contoh: Canva Pro 1 Bulan"
          required
        />
      </Field>

      <Field
        label="Slug"
        hint="Boleh dikosongkan. Sistem akan otomatis ambil dari judul."
      >
        <TextInput
          name="slug"
          defaultValue={product?.slug}
          placeholder="canva-pro-1-bulan"
        />
      </Field>

      <Field label="Kategori">
        <TextInput
          name="category"
          list="product-category-options"
          defaultValue={product?.category}
          placeholder="Design Tools"
        />
      </Field>

      <Field
        label="Upload gambar produk"
        hint="Upload file langsung dari komputer. Kalau diisi, file ini akan dipakai sebagai gambar utama produk."
      >
        <FileInput
          name="imageFile"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        />
      </Field>

      <Field
        label="Image URL"
        hint="Opsional. Bisa diisi nanti kalau mau pakai gambar produk khusus."
      >
        <TextInput
          name="imageUrl"
          type="url"
          defaultValue={product?.imageUrl}
          placeholder="https://..."
        />
      </Field>

      <div className="rounded-[24px] border border-line bg-white/70 p-4 lg:col-span-2">
        <p className="text-sm font-semibold text-foreground">Preview gambar produk</p>
        <div className="mt-4 flex items-center gap-4">
          {product?.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-20 w-20 rounded-2xl border border-line bg-white object-cover"
              />
            </>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-line bg-white text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              No image
            </div>
          )}
          <p className="text-sm leading-7 text-muted">
            Kalau belum ada gambar, kartu produk publik tetap tampil rapi
            dengan layout teks.
          </p>
        </div>
      </div>

      <Field label="Harga">
        <TextInput
          name="price"
          type="number"
          defaultValue={product?.price ?? 0}
          placeholder="15000"
          required
        />
      </Field>

      <Field label="Stok">
        <TextInput
          name="stock"
          type="number"
          defaultValue={product?.stock ?? 0}
          placeholder="10"
          required
        />
      </Field>

      <Field
        label="Deskripsi"
        className="lg:col-span-2"
      >
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          placeholder="Deskripsi singkat produk untuk buyer dan admin."
          className="rounded-[24px] border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
        />
      </Field>

      <label className="inline-flex items-center gap-3 rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm font-medium text-foreground lg:col-span-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product ? product.isActive : true}
          className="h-4 w-4 accent-[var(--brand)]"
        />
        Produk aktif dan tampil di katalog publik
      </label>
    </>
  );
}

export function ProductTable({
  products,
  notice,
  noticeTone = "success",
}: ProductTableProps) {
  const categories = Array.from(
    new Set(
      products
        .map((product) => product.category.trim())
        .filter((category) => category.length > 0),
    ),
  ).sort((left, right) => left.localeCompare(right));

  return (
    <div className="space-y-6">
      <datalist id="product-category-options">
        {categories.map((category) => (
          <option
            key={category}
            value={category}
          />
        ))}
      </datalist>

      {notice ? (
        <div className={cn("rounded-[24px] px-5 py-4 text-sm", noticeToneClasses[noticeTone])}>
          {notice}
        </div>
      ) : null}

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge tone="brand">Tambah Produk</Badge>
            <h3 className="mt-3 text-2xl font-black">Bikin item baru langsung dari dashboard</h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Form ini langsung nambah produk ke database live atau ke mode demo,
            tergantung environment yang sedang aktif.
          </p>
        </div>

        <form
          action={createProductAction}
          encType="multipart/form-data"
          className="grid gap-4 lg:grid-cols-2"
        >
          <ProductFormFields />

          <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
            <SubmitButton
              idleLabel="Tambah Produk"
              pendingLabel="Menyimpan Produk..."
              className={cn(
                "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                buttonToneClasses.brand,
              )}
            />
            <p className="text-sm leading-7 text-muted">
              Setelah submit, katalog publik dan checkout produk terkait akan otomatis ikut diperbarui.
            </p>
          </div>
        </form>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>{products.length} produk</Badge>
            <h3 className="mt-3 text-2xl font-black">Edit produk langsung dari website</h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Buka kartu produk yang mau diubah, lalu simpan. Toggle aktif/nonaktif dan hapus juga tersedia di sini.
          </p>
        </div>

        <div className="rounded-[24px] border border-brand/20 bg-brand/10 px-5 py-4 text-sm leading-7 text-brand">
          Panel ini sekarang dikunci password admin. Semua aksi produk dijalankan dari server setelah sesi admin tervalidasi.
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <details
              key={product.id}
              className="rounded-[28px] border border-line bg-white/55 transition open:bg-white/75 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-bold text-foreground">{product.title}</h4>
                    <Badge tone={product.isActive ? "success" : "danger"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    /{product.slug}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    {product.category} - dibuat {formatDateTime(product.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <Badge>{formatCurrency(product.price)}</Badge>
                  <Badge tone={product.stock <= 10 ? "accent" : "neutral"}>
                    {product.stock} stok
                  </Badge>
                  <span className="text-sm font-medium text-muted">Klik untuk edit</span>
                </div>
              </summary>

              <div className="border-t border-line px-5 py-5">
                <form
                  action={updateProductAction}
                  encType="multipart/form-data"
                  className="grid gap-4 lg:grid-cols-2"
                >
                  <input
                    type="hidden"
                    name="productId"
                    value={product.id}
                  />

                  <ProductFormFields product={product} />

                  <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                    <SubmitButton
                      idleLabel="Simpan Perubahan"
                      pendingLabel="Menyimpan..."
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                        buttonToneClasses.brand,
                      )}
                    />
                    <p className="text-sm leading-7 text-muted">
                      Perubahan judul, slug, harga, stok, dan deskripsi akan langsung memengaruhi katalog publik.
                    </p>
                  </div>
                </form>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
                  <form action={toggleProductStatusAction}>
                    <input
                      type="hidden"
                      name="productId"
                      value={product.id}
                    />
                    <input
                      type="hidden"
                      name="nextIsActive"
                      value={product.isActive ? "false" : "true"}
                    />
                    <SubmitButton
                      idleLabel={product.isActive ? "Nonaktifkan Produk" : "Aktifkan Produk"}
                      pendingLabel="Memproses..."
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                        product.isActive
                          ? buttonToneClasses.accent
                          : buttonToneClasses.neutral,
                      )}
                    />
                  </form>

                  <form action={deleteProductAction}>
                    <input
                      type="hidden"
                      name="productId"
                      value={product.id}
                    />
                    <SubmitButton
                      idleLabel="Hapus Produk"
                      pendingLabel="Menghapus..."
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                        buttonToneClasses.danger,
                      )}
                    />
                  </form>

                  <p className="text-sm leading-7 text-muted">
                    Hapus hanya untuk produk yang memang belum pernah dipakai di order. Kalau sudah terhubung ke order, sistem akan menolak penghapusan.
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
