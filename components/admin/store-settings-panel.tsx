import type { ReactNode } from "react";
import {
  CreditCard,
  LayoutTemplate,
  Navigation,
  PencilRuler,
  Settings2,
} from "lucide-react";

import {
  updatePaymentSettingsAction,
  updateStorefrontSettingsAction,
} from "@/app/admin/settings/actions";
import { RefundCalculator } from "@/components/admin/refund-calculator";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types/domain";

const noticeToneClasses = {
  success: "border border-success/20 bg-success/10 text-success",
  danger: "border border-danger/20 bg-danger/10 text-danger",
  accent: "border border-accent/20 bg-accent/10 text-accent",
} as const;

type NoticeTone = keyof typeof noticeToneClasses;

type StoreSettingsPanelProps = {
  settings: StoreSettings;
  liveMode: boolean;
  notice?: string;
  noticeTone?: NoticeTone;
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
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <input
      name={name}
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
  rows = 4,
}: {
  name: string;
  defaultValue?: string;
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

export function StoreSettingsPanel({
  settings,
  liveMode,
  notice,
  noticeTone = "success",
}: StoreSettingsPanelProps) {
  const brandMark = (settings.brandCompactName || settings.brandName)
    .split(/\s+/)
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 3)
    .join("")
    .toUpperCase() || "ARR";
  const contentBlockCount =
    settings.workflowSteps.length +
    settings.stackHighlights.length +
    settings.dashboardNotes.length +
    settings.paymentInstructionLines.length +
    settings.operationalNotesLines.length +
    settings.headerNavLabels.length +
    settings.footerLinkLabels.length;

  return (
    <div className="space-y-8">
      {notice ? (
        <div className={cn("rounded-[24px] px-5 py-4 text-sm", noticeToneClasses[noticeTone])}>
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <LayoutTemplate className="h-5 w-5 text-brand" />
            <Badge tone={liveMode ? "brand" : "accent"}>
              {liveMode ? "Live Settings" : "Mock Settings"}
            </Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Mode Konfigurasi
          </p>
          <p className="mt-2 text-3xl font-black">
            {liveMode ? "Supabase" : "Fallback"}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Semua panel template publik, checkout, dan pembayaran diambil dari
            sumber yang sama supaya perubahan admin langsung konsisten.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Settings2 className="h-5 w-5 text-accent" />
            <Badge>{contentBlockCount} blok</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Template Publik
          </p>
          <p className="mt-2 text-3xl font-black">Editable</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Brand, navigasi, banner, home sections, footer, checkout flow, dan
            instruksi pembayaran bisa diedit langsung dari dashboard.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CreditCard className="h-5 w-5 text-success" />
            <Badge tone="success">{settings.paymentMerchantName}</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Update Terakhir
          </p>
          <p className="mt-2 text-3xl font-black">
            {formatDateTime(settings.updatedAt)}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted">
            QRIS merchant, copy checkout buyer, dan elemen brand ikut memakai
            konfigurasi ini.
          </p>
        </Card>
      </section>

      <Card className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge tone="brand">Template Website</Badge>
            <h3 className="mt-3 text-2xl font-black">Edit hampir seluruh template publik</h3>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            Section ini mengendalikan brand, header, footer, homepage, dan copy
            checkout publik. Tujuannya supaya admin tidak perlu sentuh code untuk perubahan rutin.
          </p>
        </div>

        <form
          action={updateStorefrontSettingsAction}
          className="grid gap-6"
        >
          <div className="rounded-[28px] border border-line bg-white/55 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Brand & Navigasi
                </p>
                <h4 className="mt-2 text-xl font-bold">Logo, nama brand, header, dan footer</h4>
              </div>
              <Navigation className="h-5 w-5 text-brand" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Field label="Nama brand utama">
                <TextInput
                  name="brandName"
                  defaultValue={settings.brandName}
                />
              </Field>
              <Field label="Nama brand singkat">
                <TextInput
                  name="brandCompactName"
                  defaultValue={settings.brandCompactName}
                />
              </Field>
              <Field
                label="Tagline header"
                className="lg:col-span-2"
              >
                <TextInput
                  name="brandTagline"
                  defaultValue={settings.brandTagline}
                />
              </Field>
              <Field label="Badge header">
                <TextInput
                  name="headerStatusBadge"
                  defaultValue={settings.headerStatusBadge}
                />
              </Field>
              <Field label="Pesan banner demo">
                <TextareaInput
                  name="demoBannerText"
                  rows={3}
                  defaultValue={settings.demoBannerText}
                />
              </Field>
              <Field
                label="Logo URL"
                hint="Bisa pakai URL gambar publik dari Supabase Storage, CDN, atau file statis."
                className="lg:col-span-2"
              >
                <TextInput
                  name="brandLogoUrl"
                  defaultValue={settings.brandLogoUrl}
                  placeholder="https://..."
                />
              </Field>

              <div className="rounded-[24px] border border-line bg-white/70 p-4 lg:col-span-2">
                <p className="text-sm font-semibold text-foreground">Preview logo website</p>
                <div className="mt-4 flex items-center gap-4">
                  {settings.brandLogoUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.brandLogoUrl}
                        alt="Logo website"
                        className="h-16 w-16 rounded-2xl border border-line bg-white object-contain p-2"
                      />
                    </>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-lg font-black tracking-[0.24em] text-white">
                      {brandMark}
                    </div>
                  )}
                  <div className="text-sm leading-7 text-muted">
                    Logo ini akan dipakai di header storefront, footer, dan area admin.
                  </div>
                </div>
              </div>

              {settings.headerNavLabels.map((label, index) => (
                <Field
                  key={`header-nav-${index + 1}`}
                  label={`Label navigasi ${index + 1}`}
                >
                  <TextInput
                    name={`headerNavLabel${index + 1}`}
                    defaultValue={label}
                  />
                </Field>
              ))}

              <Field
                label="Deskripsi footer"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="footerDescription"
                  rows={3}
                  defaultValue={settings.footerDescription}
                />
              </Field>

              {settings.footerLinkLabels.map((label, index) => (
                <Field
                  key={`footer-link-${index + 1}`}
                  label={`Label link footer ${index + 1}`}
                >
                  <TextInput
                    name={`footerLinkLabel${index + 1}`}
                    defaultValue={label}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white/55 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Hero & Homepage
                </p>
                <h4 className="mt-2 text-xl font-bold">Copy utama landing page</h4>
              </div>
              <Badge>{settings.workflowSteps.length} step</Badge>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Field label="Hero badge">
                <TextInput
                  name="heroBadge"
                  defaultValue={settings.heroBadge}
                />
              </Field>
              <Field label="CTA utama">
                <TextInput
                  name="heroPrimaryCtaLabel"
                  defaultValue={settings.heroPrimaryCtaLabel}
                />
              </Field>
              <Field
                label="Hero title"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="heroTitle"
                  rows={3}
                  defaultValue={settings.heroTitle}
                />
              </Field>
              <Field
                label="Hero description"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="heroDescription"
                  rows={4}
                  defaultValue={settings.heroDescription}
                />
              </Field>
              <Field label="CTA kedua">
                <TextInput
                  name="heroSecondaryCtaLabel"
                  defaultValue={settings.heroSecondaryCtaLabel}
                />
              </Field>
              <Field label="Catalog badge">
                <TextInput
                  name="catalogBadge"
                  defaultValue={settings.catalogBadge}
                />
              </Field>
              <Field label="Catalog title">
                <TextInput
                  name="catalogTitle"
                  defaultValue={settings.catalogTitle}
                />
              </Field>
              <Field
                label="Catalog description"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="catalogDescription"
                  rows={4}
                  defaultValue={settings.catalogDescription}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white/55 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Card Summary & Workflow
                </p>
                <h4 className="mt-2 text-xl font-bold">Stat cards dan alur semi-auto</h4>
              </div>
              <Badge tone="accent">{settings.stackHighlights.length + settings.dashboardNotes.length} item</Badge>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Field label="Workflow badge">
                <TextInput
                  name="workflowBadge"
                  defaultValue={settings.workflowBadge}
                />
              </Field>
              <Field label="Workflow title">
                <TextInput
                  name="workflowTitle"
                  defaultValue={settings.workflowTitle}
                />
              </Field>
              <Field
                label="Workflow description"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="workflowDescription"
                  rows={4}
                  defaultValue={settings.workflowDescription}
                />
              </Field>

              {settings.workflowSteps.map((step, index) => (
                <div
                  key={`${index + 1}-${step.title}`}
                  className="grid gap-4 rounded-[24px] border border-line bg-white/70 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    Step {index + 1}
                  </p>
                  <Field label="Judul">
                    <TextInput
                      name={`workflowStepTitle${index + 1}`}
                      defaultValue={step.title}
                    />
                  </Field>
                  <Field label="Deskripsi">
                    <TextareaInput
                      name={`workflowStepDescription${index + 1}`}
                      rows={4}
                      defaultValue={step.description}
                    />
                  </Field>
                </div>
              ))}

              <Field label="Judul card catalog status">
                <TextInput
                  name="catalogStatusLabel"
                  defaultValue={settings.catalogStatusLabel}
                />
              </Field>
              <Field label="Deskripsi card catalog status">
                <TextareaInput
                  name="catalogStatusDescription"
                  rows={3}
                  defaultValue={settings.catalogStatusDescription}
                />
              </Field>
              <Field label="Judul card workflow admin">
                <TextInput
                  name="workflowStatusLabel"
                  defaultValue={settings.workflowStatusLabel}
                />
              </Field>
              <Field label="Deskripsi card workflow admin">
                <TextareaInput
                  name="workflowStatusDescription"
                  rows={3}
                  defaultValue={settings.workflowStatusDescription}
                />
              </Field>
              <Field label="Judul card operasional">
                <TextInput
                  name="operationsStatusLabel"
                  defaultValue={settings.operationsStatusLabel}
                />
              </Field>
              <Field label="Title card operasional">
                <TextInput
                  name="operationsStatusTitle"
                  defaultValue={settings.operationsStatusTitle}
                />
              </Field>
              <Field
                label="Deskripsi card operasional"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="operationsStatusDescription"
                  rows={3}
                  defaultValue={settings.operationsStatusDescription}
                />
              </Field>

              <Field label="Stack badge">
                <TextInput
                  name="stackBadge"
                  defaultValue={settings.stackBadge}
                />
              </Field>
              <Field label="Dashboard badge">
                <TextInput
                  name="dashboardBadge"
                  defaultValue={settings.dashboardBadge}
                />
              </Field>

              {settings.stackHighlights.map((item, index) => (
                <Field
                  key={`stack-${index + 1}`}
                  label={`Stack highlight ${index + 1}`}
                >
                  <TextareaInput
                    name={`stackHighlight${index + 1}`}
                    rows={3}
                    defaultValue={item}
                  />
                </Field>
              ))}

              {settings.dashboardNotes.map((item, index) => (
                <Field
                  key={`dashboard-note-${index + 1}`}
                  label={`Dashboard note ${index + 1}`}
                >
                  <TextareaInput
                    name={`dashboardNote${index + 1}`}
                    rows={3}
                    defaultValue={item}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white/55 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Checkout Template
                </p>
                <h4 className="mt-2 text-xl font-bold">Copy buyer dari form sampai tracker</h4>
              </div>
              <Badge tone="brand">{settings.operationalNotesLines.length} notes</Badge>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Field label="Checkout eyebrow">
                <TextInput
                  name="checkoutEyebrow"
                  defaultValue={settings.checkoutEyebrow}
                />
              </Field>
              <Field label="Judul tracker">
                <TextInput
                  name="trackerTitle"
                  defaultValue={settings.trackerTitle}
                />
              </Field>
              <Field
                label="Deskripsi intro checkout"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="checkoutIntroDescription"
                  rows={4}
                  defaultValue={settings.checkoutIntroDescription}
                />
              </Field>
              <Field label="Judul form buyer">
                <TextInput
                  name="buyerFormTitle"
                  defaultValue={settings.buyerFormTitle}
                />
              </Field>
              <Field label="Tombol lanjut checkout">
                <TextInput
                  name="checkoutContinueButtonLabel"
                  defaultValue={settings.checkoutContinueButtonLabel}
                />
              </Field>
              <Field
                label="Deskripsi form buyer"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="buyerFormDescription"
                  rows={3}
                  defaultValue={settings.buyerFormDescription}
                />
              </Field>
              <Field label="Judul buyer ready">
                <TextInput
                  name="buyerReadyTitle"
                  defaultValue={settings.buyerReadyTitle}
                />
              </Field>
              <Field
                label="Deskripsi buyer ready"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="buyerReadyDescription"
                  rows={3}
                  defaultValue={settings.buyerReadyDescription}
                />
              </Field>
              <Field label="Judul konfirmasi bayar">
                <TextInput
                  name="paymentConfirmTitle"
                  defaultValue={settings.paymentConfirmTitle}
                />
              </Field>
              <Field label="Tombol konfirmasi bayar">
                <TextInput
                  name="paymentConfirmButtonLabel"
                  defaultValue={settings.paymentConfirmButtonLabel}
                />
              </Field>
              <Field
                label="Deskripsi konfirmasi bayar"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="paymentConfirmDescription"
                  rows={3}
                  defaultValue={settings.paymentConfirmDescription}
                />
              </Field>
              <Field
                label="Pesan sukses konfirmasi bayar"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="paymentSuccessMessage"
                  rows={3}
                  defaultValue={settings.paymentSuccessMessage}
                />
              </Field>
              <Field label="Label catatan pembayaran">
                <TextInput
                  name="paymentNoteLabel"
                  defaultValue={settings.paymentNoteLabel}
                />
              </Field>
              <Field label="Label upload bukti bayar">
                <TextInput
                  name="proofUploadLabel"
                  defaultValue={settings.proofUploadLabel}
                />
              </Field>
              <Field label="Judul catatan operasional">
                <TextInput
                  name="operationalNotesTitle"
                  defaultValue={settings.operationalNotesTitle}
                />
              </Field>
              <Field label="Judul snapshot order">
                <TextInput
                  name="orderSnapshotTitle"
                  defaultValue={settings.orderSnapshotTitle}
                />
              </Field>
              <Field
                label="Deskripsi catatan operasional"
                className="lg:col-span-2"
              >
                <TextareaInput
                  name="operationalNotesDescription"
                  rows={3}
                  defaultValue={settings.operationalNotesDescription}
                />
              </Field>

              {settings.operationalNotesLines.map((line, index) => (
                <Field
                  key={`operational-line-${index + 1}`}
                  label={`Catatan operasional ${index + 1}`}
                >
                  <TextareaInput
                    name={`operationalNotesLine${index + 1}`}
                    rows={3}
                    defaultValue={line}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton
              idleLabel="Simpan Template Website"
              pendingLabel="Menyimpan Template..."
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
            />
            <p className="text-sm leading-7 text-muted">
              Setelah disimpan, header, footer, homepage, dan slug checkout publik akan ikut direfresh otomatis.
            </p>
          </div>
        </form>
      </Card>

      <Card className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge tone="accent">Pembayaran</Badge>
            <h3 className="mt-3 text-2xl font-black">Atur panel checkout dan QRIS</h3>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            QRIS di checkout buyer dihasilkan dari payload yang kamu simpan di sini. Nominal produk tetap mengikuti harga item masing-masing.
          </p>
        </div>

        <form
          action={updatePaymentSettingsAction}
          className="grid gap-6"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Label QRIS">
              <TextInput
                name="paymentDisplayLabel"
                defaultValue={settings.paymentDisplayLabel}
              />
            </Field>
            <Field label="Merchant name">
              <TextInput
                name="paymentMerchantName"
                defaultValue={settings.paymentMerchantName}
              />
            </Field>
            <Field label="Merchant city">
              <TextInput
                name="paymentMerchantCity"
                defaultValue={settings.paymentMerchantCity}
              />
            </Field>
            <Field label="Judul panel pembayaran QRIS">
              <TextInput
                name="paymentCheckoutTitle"
                defaultValue={settings.paymentCheckoutTitle}
              />
            </Field>
            <Field
              label="Deskripsi panel pembayaran QRIS"
              className="lg:col-span-2"
            >
              <TextareaInput
                name="paymentCheckoutDescription"
                rows={4}
                defaultValue={settings.paymentCheckoutDescription}
              />
            </Field>
            <Field
              label="Payload QRIS"
              hint="Gunakan string EMV utuh dari merchant QRIS. QR akan digenerate ulang dari payload ini."
              className="lg:col-span-2"
            >
              <TextareaInput
                name="paymentQrisPayload"
                rows={6}
                defaultValue={settings.paymentQrisPayload}
              />
            </Field>
          </div>

          <div className="rounded-[28px] border border-line bg-white/55 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Instruksi Buyer
                </p>
                <h4 className="mt-2 text-xl font-bold">Ringkasan pembayaran di checkout</h4>
              </div>
              <Badge tone="brand">{settings.paymentInstructionLines.length} poin</Badge>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {settings.paymentInstructionLines.map((line, index) => (
                <Field
                  key={`payment-line-${index + 1}`}
                  label={`Instruksi ${index + 1}`}
                >
                  <TextareaInput
                    name={`paymentInstructionLine${index + 1}`}
                    rows={3}
                    defaultValue={line}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton
              idleLabel="Simpan Pengaturan Pembayaran"
              pendingLabel="Menyimpan QRIS..."
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c26f05] disabled:cursor-not-allowed disabled:opacity-70"
            />
            <p className="text-sm leading-7 text-muted">
              Kalau payload QRIS diganti, semua halaman checkout publik akan ikut menampilkan QR baru.
            </p>
          </div>
        </form>
      </Card>

      <RefundCalculator />

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand/10 p-3 text-brand">
            <PencilRuler className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Catatan implementasi</h3>
            <p className="text-sm leading-7 text-muted">
              Template publik yang sekarang tampil di website sudah dipindah ke
              panel admin supaya perubahan rutin bisa dikerjakan tanpa edit code.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm leading-7 text-muted">
          <p>Kalau Supabase live aktif dan schema terbaru sudah dijalankan, perubahan akan tersimpan permanen di table `store_settings`.</p>
          <p>Kalau table itu belum ada, mode fallback tetap menjaga halaman publik hidup, tapi perubahan admin hanya tersimpan sementara di memori server.</p>
          <p>Refund calculator tidak menyimpan data; fungsinya murni tool internal supaya admin bisa hitung prorata lebih cepat.</p>
        </div>
      </Card>
    </div>
  );
}
