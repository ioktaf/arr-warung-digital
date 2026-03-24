import type { ReactNode } from "react";

import {
  createPromoCodeAction,
  deletePromoCodeAction,
  togglePromoCodeStatusAction,
  updatePromoCodeAction,
} from "@/app/admin/promos/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PromoCode } from "@/types/domain";

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

type PromoCodeTableProps = {
  promos: PromoCode[];
  notice?: string;
  noticeTone?: NoticeTone;
};

type PromoFormFieldsProps = {
  promo?: PromoCode;
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
  required,
}: {
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
    />
  );
}

function TextareaInput({
  name,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      name={name}
      rows={rows}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      className="rounded-[24px] border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
    />
  );
}

function PromoFormFields({ promo }: PromoFormFieldsProps) {
  return (
    <>
      <Field label="Kode promo">
        <TextInput
          name="code"
          defaultValue={promo?.code}
          placeholder="HEMAT10"
          required
        />
      </Field>

      <Field label="Label promo">
        <TextInput
          name="label"
          defaultValue={promo?.label}
          placeholder="Potong 10 Ribu"
          required
        />
      </Field>

      <Field
        label="Deskripsi"
        className="lg:col-span-2"
      >
        <TextareaInput
          name="description"
          defaultValue={promo?.description}
          placeholder="Opsional. Dipakai untuk catatan internal admin."
        />
      </Field>

      <Field label="Tipe diskon">
        <select
          name="discountType"
          defaultValue={promo?.discountType ?? "fixed"}
          className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
        >
          <option value="fixed">Potongan tetap (Rp)</option>
          <option value="percent">Persentase (%)</option>
        </select>
      </Field>

      <Field label="Nilai diskon">
        <TextInput
          name="discountValue"
          type="number"
          defaultValue={promo?.discountValue ?? 10000}
          placeholder="10000 atau 10"
          required
        />
      </Field>

      <Field label="Minimum subtotal">
        <TextInput
          name="minimumSubtotal"
          type="number"
          defaultValue={promo?.minimumSubtotal ?? 0}
          placeholder="0"
          required
        />
      </Field>

      <Field
        label="Maksimal diskon"
        hint="Kosongkan kalau tidak perlu batas maksimal. Cocok untuk diskon persen."
      >
        <TextInput
          name="maxDiscount"
          type="number"
          defaultValue={promo?.maxDiscount}
          placeholder="15000"
        />
      </Field>

      <label className="inline-flex items-center gap-3 rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm font-medium text-foreground lg:col-span-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={promo ? promo.isActive : true}
          className="h-4 w-4 accent-[var(--brand)]"
        />
        Promo aktif dan bisa dipakai buyer di checkout
      </label>
    </>
  );
}

export function PromoCodeTable({
  promos,
  notice,
  noticeTone = "success",
}: PromoCodeTableProps) {
  return (
    <div className="space-y-6">
      {notice ? (
        <div className={cn("rounded-[24px] px-5 py-4 text-sm", noticeToneClasses[noticeTone])}>
          {notice}
        </div>
      ) : null}

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge tone="brand">Tambah Promo</Badge>
            <h3 className="mt-3 text-2xl font-black">Buat kode promo baru</h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Buyer hanya melihat dropdown promo di checkout. Kode, diskon, dan aturan
            minimumnya diatur penuh dari dashboard ini.
          </p>
        </div>

        <form
          action={createPromoCodeAction}
          className="grid gap-4 lg:grid-cols-2"
        >
          <PromoFormFields />

          <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
            <SubmitButton
              idleLabel="Tambah Promo"
              pendingLabel="Menyimpan Promo..."
              className={cn(
                "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                buttonToneClasses.brand,
              )}
            />
          </div>
        </form>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>{promos.length} promo</Badge>
            <h3 className="mt-3 text-2xl font-black">Kelola promo aktif</h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Nonaktifkan promo kalau sudah tidak dipakai. Buyer tetap bisa checkout
            biasa tanpa membuka form promo.
          </p>
        </div>

        <div className="space-y-4">
          {promos.map((promo) => (
            <details
              key={promo.id}
              className="rounded-[28px] border border-line bg-white/55 transition open:bg-white/75 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-bold text-foreground">{promo.code}</h4>
                    <Badge tone={promo.isActive ? "success" : "danger"}>
                      {promo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm leading-7 text-muted">{promo.label}</p>
                  <p className="text-sm leading-7 text-muted">
                    Dibuat {formatDateTime(promo.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <Badge tone="accent">
                    {promo.discountType === "percent"
                      ? `${promo.discountValue}%`
                      : formatCurrency(promo.discountValue)}
                  </Badge>
                  <Badge>
                    Min. {formatCurrency(promo.minimumSubtotal)}
                  </Badge>
                  <span className="text-sm font-medium text-muted">Klik untuk edit</span>
                </div>
              </summary>

              <div className="border-t border-line px-5 py-5">
                <form
                  action={updatePromoCodeAction}
                  className="grid gap-4 lg:grid-cols-2"
                >
                  <input
                    type="hidden"
                    name="promoId"
                    value={promo.id}
                  />
                  <PromoFormFields promo={promo} />

                  <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                    <SubmitButton
                      idleLabel="Simpan Perubahan"
                      pendingLabel="Menyimpan..."
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                        buttonToneClasses.brand,
                      )}
                    />
                  </div>
                </form>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
                  <form action={togglePromoCodeStatusAction}>
                    <input
                      type="hidden"
                      name="promoId"
                      value={promo.id}
                    />
                    <input
                      type="hidden"
                      name="nextIsActive"
                      value={promo.isActive ? "false" : "true"}
                    />
                    <SubmitButton
                      idleLabel={promo.isActive ? "Nonaktifkan Promo" : "Aktifkan Promo"}
                      pendingLabel="Memproses..."
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                        promo.isActive
                          ? buttonToneClasses.accent
                          : buttonToneClasses.neutral,
                      )}
                    />
                  </form>

                  <form action={deletePromoCodeAction}>
                    <input
                      type="hidden"
                      name="promoId"
                      value={promo.id}
                    />
                    <SubmitButton
                      idleLabel="Hapus Promo"
                      pendingLabel="Menghapus..."
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
                        buttonToneClasses.danger,
                      )}
                    />
                  </form>
                </div>
              </div>
            </details>
          ))}

          {!promos.length ? (
            <div className="rounded-[24px] border border-line bg-white/60 px-5 py-4 text-sm text-muted">
              Belum ada promo. Buyer tetap bisa checkout biasa tanpa kode promo.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
