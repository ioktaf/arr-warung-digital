import Link from "next/link";
import { ArrowRight, CircleCheckBig, MessageCircle, QrCode, ShieldCheck } from "lucide-react";

import { CatalogBrowser } from "@/components/store/catalog-browser";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCatalogProducts, getStoreSettings } from "@/lib/data";
import { formatWhatsappHref, normalizeWhatsappNumber } from "@/lib/utils";

const faqItems = [
  {
    question: "Bagaimana cara order di website ini?",
    answer:
      "Pilih produk, atur jumlah seat, lalu langsung checkout. Setelah order dibuat, scan QRIS sesuai nominal yang tampil dan kirim konfirmasi bayar dari halaman yang sama.",
  },
  {
    question: "Apakah saya bisa checkout beberapa produk sekaligus?",
    answer:
      "Bisa. Tambahkan dulu ke keranjang, lalu lanjut checkout keranjang agar semua item dibayar dalam satu order.",
  },
  {
    question: "Apakah upload bukti bayar wajib?",
    answer:
      "Tidak wajib, tapi sangat membantu admin saat mencocokkan mutasi, terutama kalau nominal transfer terlihat mirip dengan order lain.",
  },
  {
    question: "Bagaimana cara cek status order saya?",
    answer:
      "Buka menu Lacak Order, lalu masukkan order ref dan nomor WhatsApp yang kamu pakai saat checkout.",
  },
];

const benefitItems = [
  {
    title: "Checkout cepat",
    description: "Tanpa akun, tanpa langkah bertele-tele. Buyer bisa langsung pilih dan bayar.",
    icon: CircleCheckBig,
  },
  {
    title: "Seat fleksibel",
    description: "Jumlah slot atau seat bisa disesuaikan dulu sebelum lanjut ke pembayaran.",
    icon: ShieldCheck,
  },
  {
    title: "QRIS praktis",
    description: "QRIS langsung tampil dengan nominal order yang sudah sesuai saat checkout.",
    icon: QrCode,
  },
];

const legacyHeroTitle =
  "Jualan produk digital dengan checkout cepat, QRIS, dan verifikasi mutasi manual yang tetap terasa modern.";
const legacyHeroDescription =
  "Buyer bisa checkout tanpa login, admin dapat notifikasi order yang perlu dicek, dan semua fondasinya sudah disiapkan buat nyambung ke Supabase.";
const legacyWorkflowTitle = "Buyer simpel, admin tetap pegang kendali.";
const legacyWorkflowDescription =
  "Flow ini sengaja dibuat hemat biaya: belum perlu langganan API mutasi, tapi UX buyer tetap rapi dan admin tidak perlu nebak-nebak transfer masuk itu milik siapa.";
const legacyCatalogTitle = "Struktur produk sudah siap buat dihubungkan ke Supabase.";
const legacyCatalogDescription =
  "Saat env belum ada, halaman ini tetap hidup pakai mock data. Begitu tabel `products` terisi, storefront otomatis baca data live.";

export default async function StorefrontPage() {
  const products = await getCatalogProducts();
  const settings = await getStoreSettings();
  const hasWhatsappContact = Boolean(
    normalizeWhatsappNumber(settings.contactWhatsappNumber),
  );
  const contactHref = hasWhatsappContact
    ? formatWhatsappHref(settings.contactWhatsappNumber)
    : "/track";

  const heroTitle =
    settings.heroTitle === legacyHeroTitle
      ? "Produk digital favoritmu, checkout cepat, dan proses bayar yang mudah dipahami."
      : settings.heroTitle;
  const heroDescription =
    settings.heroDescription === legacyHeroDescription
      ? "Pilih produk, atur jumlah seat, scan QRIS, lalu kirim konfirmasi bayar. Kami bantu terus sampai akses diterima."
      : settings.heroDescription;
  const workflowTitle =
    settings.workflowTitle === legacyWorkflowTitle
      ? "Tiga langkah singkat, langsung beres."
      : settings.workflowTitle;
  const workflowDescription =
    settings.workflowDescription === legacyWorkflowDescription
      ? "Fokus kami bikin alur pembelian tetap ringan di buyer: tidak ribet, tidak banyak klik, dan tetap jelas sampai pembayaran diverifikasi."
      : settings.workflowDescription;
  const catalogTitle =
    settings.catalogTitle === legacyCatalogTitle
      ? "Pilih produk yang kamu butuhkan."
      : settings.catalogTitle;
  const catalogDescription =
    settings.catalogDescription === legacyCatalogDescription
      ? "Semua produk aktif bisa langsung dipilih, atur jumlah seat, lalu masukkan ke keranjang atau checkout langsung."
      : settings.catalogDescription;

  const heroBadge =
    settings.heroBadge === "Storefront MVP" ? "Belanja Lebih Cepat" : settings.heroBadge;
  const workflowBadge =
    settings.workflowBadge === "Alur Semi-Auto" ? "Cara Order" : settings.workflowBadge;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-accent to-brand" />
          <div className="max-w-3xl space-y-6">
            <Badge tone="accent">{heroBadge || "Belanja Lebih Cepat"}</Badge>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                {heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#produk"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                {settings.heroPrimaryCtaLabel || "Lihat Produk"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                Lacak Order
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {benefitItems.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-brand" />
                  <Badge>{item.title}</Badge>
                </div>
                <p className="mt-6 text-2xl font-black">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="cara-order"
        className="mt-16"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge>{workflowBadge || "Cara Order"}</Badge>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{workflowTitle}</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            {workflowDescription}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {settings.workflowSteps.slice(0, 3).map((step, index) => (
            <Card
              key={step.title}
              className="relative"
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge tone="brand">Step {index + 1}</Badge>
                <CircleCheckBig className="h-5 w-5 text-brand" />
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="produk"
        className="mt-16"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge tone="brand">{settings.catalogBadge || "Katalog"}</Badge>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{catalogTitle}</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            {catalogDescription}
          </p>
        </div>

        <CatalogBrowser products={products} />
      </section>

      <section
        id="faq"
        className="mt-16"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge tone="accent">FAQ</Badge>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Jawaban singkat sebelum kamu checkout
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Ringkas, jelas, dan fokus ke hal yang biasanya paling sering ditanyakan buyer.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {faqItems.map((item) => (
            <Card key={item.question}>
              <h3 className="text-xl font-bold">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Card className="flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <Badge tone="brand">Siap Belanja</Badge>
            <h2 className="mt-3 text-3xl font-black">
              Mau langsung pilih produk atau cek order yang sudah ada?
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Semua alurnya sudah disederhanakan supaya buyer cepat paham dan admin tetap mudah verifikasi.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[240px]">
            <Link
              href="#produk"
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Lihat Produk
            </Link>
            <Link
              href={contactHref}
              target={hasWhatsappContact ? "_blank" : undefined}
              rel={hasWhatsappContact ? "noreferrer" : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              <MessageCircle className="h-4 w-4" />
              {settings.contactWhatsappLabel || "Kontak WhatsApp"}
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
