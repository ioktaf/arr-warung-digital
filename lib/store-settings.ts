import type {
  StoreSettings,
  StoreSettingsInput,
  StoreWorkflowStep,
} from "@/types/domain";

const defaultWorkflowSteps: StoreWorkflowStep[] = [
  {
    title: "Buyer pilih produk",
    description:
      "Guest checkout cukup isi nama dan WhatsApp, lalu sistem arahkan ke halaman pembayaran QRIS.",
  },
  {
    title: "Buyer klik konfirmasi bayar",
    description:
      "Bukti transfer opsional, tapi tombol konfirmasi bikin admin tahu ada transaksi yang perlu dicocokkan.",
  },
  {
    title: "Admin verifikasi mutasi",
    description:
      "Dashboard menyorot order Awaiting Verification supaya admin tinggal cek mutasi bank atau e-wallet.",
  },
  {
    title: "Admin kirim akun",
    description:
      "Setelah status Paid, admin bisa kirim akun via WhatsApp dan tutup order ke Completed.",
  },
];

const defaultStackHighlights = [
  "Next.js App Router untuk storefront dan dashboard admin",
  "Supabase PostgreSQL + Storage untuk order dan bukti bayar",
  "Realtime-ready untuk notif order masuk",
  "Deploy ringan di Vercel dengan env Supabase",
];

const defaultDashboardNotes = [
  "Order baru masuk ke Pending saat buyer submit data checkout.",
  "Saat buyer klik konfirmasi bayar, order naik ke Awaiting Verification.",
  "Admin cek mutasi manual, lalu update status ke Paid dan Completed.",
];

const defaultPaymentInstructionLines = [
  "Scan QRIS merchant ARR WARUNG DIGITAL.",
  "Pastikan nominal yang dibayar sama dengan harga produk.",
  "Kembali ke halaman ini lalu klik konfirmasi bayar.",
  "Upload bukti transfer kalau ada biar admin lebih cepat cek.",
];

const defaultHeaderNavLabels = [
  "Produk",
  "Alur Semi-Auto",
  "Dashboard Admin",
];

const defaultFooterLinkLabels = [
  "Storefront",
  "Admin",
  "Checkout Demo",
];

const defaultOperationalNotesLines = [
  "Admin tidak perlu mantengin mutasi tanpa konteks karena order masuk ke dashboard lebih dulu.",
  "Proof upload bersifat opsional, tapi sangat membantu saat nominal order mirip-mirip.",
  "Kalau nanti mau full-auto, struktur tabel order dan payment proof ini masih enak untuk ditingkatkan.",
];

export const defaultStoreSettingsInput: StoreSettingsInput = {
  brandName: "ARR Warung Digital",
  brandCompactName: "Warung Digital",
  brandLogoUrl: "",
  brandTagline: "Guest checkout, QRIS, manual mutation check",
  headerStatusBadge: "Semi-Auto",
  headerNavLabels: defaultHeaderNavLabels,
  footerDescription:
    "Fondasi MVP untuk jualan akun digital dengan verifikasi pembayaran manual yang tetap rapi.",
  footerLinkLabels: defaultFooterLinkLabels,
  demoBannerText:
    "Mode demo aktif. Isi `.env.local` dan jalankan `supabase/schema.sql` di Supabase SQL Editor untuk workflow live.",
  heroBadge: "Storefront MVP",
  heroTitle:
    "Jualan produk digital dengan checkout cepat, QRIS, dan verifikasi mutasi manual yang tetap terasa modern.",
  heroDescription:
    "Buyer bisa checkout tanpa login, admin dapat notifikasi order yang perlu dicek, dan semua fondasinya sudah disiapkan buat nyambung ke Supabase.",
  heroPrimaryCtaLabel: "Lihat Produk",
  heroSecondaryCtaLabel: "Buka Dashboard Admin",
  workflowBadge: "Alur Semi-Auto",
  workflowTitle: "Buyer simpel, admin tetap pegang kendali.",
  workflowDescription:
    "Flow ini sengaja dibuat hemat biaya: belum perlu langganan API mutasi, tapi UX buyer tetap rapi dan admin tidak perlu nebak-nebak transfer masuk itu milik siapa.",
  workflowSteps: defaultWorkflowSteps,
  catalogBadge: "Katalog",
  catalogTitle: "Struktur produk sudah siap buat dihubungkan ke Supabase.",
  catalogDescription:
    "Saat env belum ada, halaman ini tetap hidup pakai mock data. Begitu tabel `products` terisi, storefront otomatis baca data live.",
  stackBadge: "Stack Ready",
  stackHighlights: defaultStackHighlights,
  dashboardBadge: "Catatan Dashboard",
  dashboardNotes: defaultDashboardNotes,
  catalogStatusLabel: "Status Catalog",
  catalogStatusDescription:
    "Data produk otomatis fallback ke mock jika env Supabase belum diisi.",
  workflowStatusLabel: "Workflow Admin",
  workflowStatusDescription:
    "Service role dipakai di server untuk bikin order, upload bukti bayar, dan baca dashboard admin.",
  operationsStatusLabel: "Operasional",
  operationsStatusTitle: "Manual but guided",
  operationsStatusDescription:
    "Fokus admin tetap jelas: cek order yang butuh verifikasi dulu, baru lanjut kirim akun.",
  checkoutEyebrow: "Checkout Produk",
  checkoutIntroDescription:
    "Buyer cukup isi nama dan WhatsApp dulu. Setelah itu sistem arahkan ke QRIS dan tombol konfirmasi pembayaran.",
  buyerFormTitle: "1. Isi Data Buyer",
  buyerFormDescription:
    "Data ini dipakai admin untuk cocokin pembayaran dan kirim akun lewat WhatsApp.",
  buyerReadyTitle: "Data Buyer Tersimpan",
  buyerReadyDescription: "Order siap lanjut ke tahap pembayaran QRIS.",
  paymentDisplayLabel: "QRIS Statis ARR WARUNG DIGITAL",
  paymentQrisPayload:
    "00020101021126760024ID.CO.SPEEDCASH.MERCHANT01189360081530002045920215ID10250020459260303UKE51440014ID.CO.QRIS.WWW0215ID10254280460520303UKE5204526253033605802ID5918ARR WARUNG DIGITAL6006KENDAL61055138162330509S3443864101091263033620703A016304E9B0",
  paymentMerchantName: "ARR WARUNG DIGITAL",
  paymentMerchantCity: "KENDAL",
  paymentCheckoutTitle: "2. Transfer via QRIS",
  paymentCheckoutDescription:
    "Pakai QRIS statis merchant dulu. Setelah transfer, buyer klik konfirmasi pembayaran di bawah.",
  paymentInstructionLines: defaultPaymentInstructionLines,
  paymentConfirmTitle: "3. Konfirmasi Sudah Bayar",
  paymentConfirmDescription:
    "Begitu form ini dikirim, order masuk ke status Awaiting Verification di dashboard admin.",
  paymentSuccessMessage:
    "Konfirmasi pembayaran sudah dikirim. Admin tinggal cek mutasi lalu update status order di dashboard.",
  paymentNoteLabel: "Catatan Pembayaran",
  proofUploadLabel: "Upload Bukti Bayar",
  paymentConfirmButtonLabel: "Konfirmasi Sudah Bayar",
  checkoutContinueButtonLabel: "Lanjut ke Pembayaran",
  trackerTitle: "Tracker Order",
  operationalNotesTitle: "Catatan Operasional",
  operationalNotesDescription:
    "Halaman ini memang dibuat untuk workflow semi-auto.",
  operationalNotesLines: defaultOperationalNotesLines,
  orderSnapshotTitle: "Snapshot Order",
};

export const defaultStoreSettings: StoreSettings = {
  id: "mock-store-settings",
  key: "default",
  updatedAt: new Date(0).toISOString(),
  ...defaultStoreSettingsInput,
};

export function extractStoreSettingsInput(
  settings: StoreSettings | StoreSettingsInput,
): StoreSettingsInput {
  return {
    brandName: settings.brandName,
    brandCompactName: settings.brandCompactName,
    brandLogoUrl: settings.brandLogoUrl,
    brandTagline: settings.brandTagline,
    headerStatusBadge: settings.headerStatusBadge,
    headerNavLabels: settings.headerNavLabels,
    footerDescription: settings.footerDescription,
    footerLinkLabels: settings.footerLinkLabels,
    demoBannerText: settings.demoBannerText,
    heroBadge: settings.heroBadge,
    heroTitle: settings.heroTitle,
    heroDescription: settings.heroDescription,
    heroPrimaryCtaLabel: settings.heroPrimaryCtaLabel,
    heroSecondaryCtaLabel: settings.heroSecondaryCtaLabel,
    workflowBadge: settings.workflowBadge,
    workflowTitle: settings.workflowTitle,
    workflowDescription: settings.workflowDescription,
    workflowSteps: settings.workflowSteps,
    catalogBadge: settings.catalogBadge,
    catalogTitle: settings.catalogTitle,
    catalogDescription: settings.catalogDescription,
    stackBadge: settings.stackBadge,
    stackHighlights: settings.stackHighlights,
    dashboardBadge: settings.dashboardBadge,
    dashboardNotes: settings.dashboardNotes,
    catalogStatusLabel: settings.catalogStatusLabel,
    catalogStatusDescription: settings.catalogStatusDescription,
    workflowStatusLabel: settings.workflowStatusLabel,
    workflowStatusDescription: settings.workflowStatusDescription,
    operationsStatusLabel: settings.operationsStatusLabel,
    operationsStatusTitle: settings.operationsStatusTitle,
    operationsStatusDescription: settings.operationsStatusDescription,
    checkoutEyebrow: settings.checkoutEyebrow,
    checkoutIntroDescription: settings.checkoutIntroDescription,
    buyerFormTitle: settings.buyerFormTitle,
    buyerFormDescription: settings.buyerFormDescription,
    buyerReadyTitle: settings.buyerReadyTitle,
    buyerReadyDescription: settings.buyerReadyDescription,
    paymentDisplayLabel: settings.paymentDisplayLabel,
    paymentQrisPayload: settings.paymentQrisPayload,
    paymentMerchantName: settings.paymentMerchantName,
    paymentMerchantCity: settings.paymentMerchantCity,
    paymentCheckoutTitle: settings.paymentCheckoutTitle,
    paymentCheckoutDescription: settings.paymentCheckoutDescription,
    paymentInstructionLines: settings.paymentInstructionLines,
    paymentConfirmTitle: settings.paymentConfirmTitle,
    paymentConfirmDescription: settings.paymentConfirmDescription,
    paymentSuccessMessage: settings.paymentSuccessMessage,
    paymentNoteLabel: settings.paymentNoteLabel,
    proofUploadLabel: settings.proofUploadLabel,
    paymentConfirmButtonLabel: settings.paymentConfirmButtonLabel,
    checkoutContinueButtonLabel: settings.checkoutContinueButtonLabel,
    trackerTitle: settings.trackerTitle,
    operationalNotesTitle: settings.operationalNotesTitle,
    operationalNotesDescription: settings.operationalNotesDescription,
    operationalNotesLines: settings.operationalNotesLines,
    orderSnapshotTitle: settings.orderSnapshotTitle,
  };
}

function normalizeText(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function normalizeStringList(
  value: string[] | undefined,
  fallback: string[],
) {
  return fallback.map((fallbackItem, index) => {
    const candidate = value?.[index]?.trim();
    return candidate ? candidate : fallbackItem;
  });
}

function normalizeWorkflowSteps(
  value: StoreWorkflowStep[] | undefined,
  fallback: StoreWorkflowStep[],
) {
  return fallback.map((fallbackStep, index) => {
    const candidate = value?.[index];

    return {
      title: normalizeText(candidate?.title, fallbackStep.title),
      description: normalizeText(candidate?.description, fallbackStep.description),
    };
  });
}

export function normalizeStoreSettingsInput(
  input: Partial<StoreSettingsInput>,
): StoreSettingsInput {
  return {
    brandName: normalizeText(input.brandName, defaultStoreSettingsInput.brandName),
    brandCompactName: normalizeText(
      input.brandCompactName,
      defaultStoreSettingsInput.brandCompactName,
    ),
    brandLogoUrl: normalizeText(
      input.brandLogoUrl,
      defaultStoreSettingsInput.brandLogoUrl,
    ),
    brandTagline: normalizeText(
      input.brandTagline,
      defaultStoreSettingsInput.brandTagline,
    ),
    headerStatusBadge: normalizeText(
      input.headerStatusBadge,
      defaultStoreSettingsInput.headerStatusBadge,
    ),
    headerNavLabels: normalizeStringList(
      input.headerNavLabels,
      defaultStoreSettingsInput.headerNavLabels,
    ),
    footerDescription: normalizeText(
      input.footerDescription,
      defaultStoreSettingsInput.footerDescription,
    ),
    footerLinkLabels: normalizeStringList(
      input.footerLinkLabels,
      defaultStoreSettingsInput.footerLinkLabels,
    ),
    demoBannerText: normalizeText(
      input.demoBannerText,
      defaultStoreSettingsInput.demoBannerText,
    ),
    heroBadge: normalizeText(input.heroBadge, defaultStoreSettingsInput.heroBadge),
    heroTitle: normalizeText(input.heroTitle, defaultStoreSettingsInput.heroTitle),
    heroDescription: normalizeText(
      input.heroDescription,
      defaultStoreSettingsInput.heroDescription,
    ),
    heroPrimaryCtaLabel: normalizeText(
      input.heroPrimaryCtaLabel,
      defaultStoreSettingsInput.heroPrimaryCtaLabel,
    ),
    heroSecondaryCtaLabel: normalizeText(
      input.heroSecondaryCtaLabel,
      defaultStoreSettingsInput.heroSecondaryCtaLabel,
    ),
    workflowBadge: normalizeText(
      input.workflowBadge,
      defaultStoreSettingsInput.workflowBadge,
    ),
    workflowTitle: normalizeText(
      input.workflowTitle,
      defaultStoreSettingsInput.workflowTitle,
    ),
    workflowDescription: normalizeText(
      input.workflowDescription,
      defaultStoreSettingsInput.workflowDescription,
    ),
    workflowSteps: normalizeWorkflowSteps(
      input.workflowSteps,
      defaultStoreSettingsInput.workflowSteps,
    ),
    catalogBadge: normalizeText(
      input.catalogBadge,
      defaultStoreSettingsInput.catalogBadge,
    ),
    catalogTitle: normalizeText(
      input.catalogTitle,
      defaultStoreSettingsInput.catalogTitle,
    ),
    catalogDescription: normalizeText(
      input.catalogDescription,
      defaultStoreSettingsInput.catalogDescription,
    ),
    stackBadge: normalizeText(input.stackBadge, defaultStoreSettingsInput.stackBadge),
    stackHighlights: normalizeStringList(
      input.stackHighlights,
      defaultStoreSettingsInput.stackHighlights,
    ),
    dashboardBadge: normalizeText(
      input.dashboardBadge,
      defaultStoreSettingsInput.dashboardBadge,
    ),
    dashboardNotes: normalizeStringList(
      input.dashboardNotes,
      defaultStoreSettingsInput.dashboardNotes,
    ),
    catalogStatusLabel: normalizeText(
      input.catalogStatusLabel,
      defaultStoreSettingsInput.catalogStatusLabel,
    ),
    catalogStatusDescription: normalizeText(
      input.catalogStatusDescription,
      defaultStoreSettingsInput.catalogStatusDescription,
    ),
    workflowStatusLabel: normalizeText(
      input.workflowStatusLabel,
      defaultStoreSettingsInput.workflowStatusLabel,
    ),
    workflowStatusDescription: normalizeText(
      input.workflowStatusDescription,
      defaultStoreSettingsInput.workflowStatusDescription,
    ),
    operationsStatusLabel: normalizeText(
      input.operationsStatusLabel,
      defaultStoreSettingsInput.operationsStatusLabel,
    ),
    operationsStatusTitle: normalizeText(
      input.operationsStatusTitle,
      defaultStoreSettingsInput.operationsStatusTitle,
    ),
    operationsStatusDescription: normalizeText(
      input.operationsStatusDescription,
      defaultStoreSettingsInput.operationsStatusDescription,
    ),
    checkoutEyebrow: normalizeText(
      input.checkoutEyebrow,
      defaultStoreSettingsInput.checkoutEyebrow,
    ),
    checkoutIntroDescription: normalizeText(
      input.checkoutIntroDescription,
      defaultStoreSettingsInput.checkoutIntroDescription,
    ),
    buyerFormTitle: normalizeText(
      input.buyerFormTitle,
      defaultStoreSettingsInput.buyerFormTitle,
    ),
    buyerFormDescription: normalizeText(
      input.buyerFormDescription,
      defaultStoreSettingsInput.buyerFormDescription,
    ),
    buyerReadyTitle: normalizeText(
      input.buyerReadyTitle,
      defaultStoreSettingsInput.buyerReadyTitle,
    ),
    buyerReadyDescription: normalizeText(
      input.buyerReadyDescription,
      defaultStoreSettingsInput.buyerReadyDescription,
    ),
    paymentDisplayLabel: normalizeText(
      input.paymentDisplayLabel,
      defaultStoreSettingsInput.paymentDisplayLabel,
    ),
    paymentQrisPayload: normalizeText(
      input.paymentQrisPayload,
      defaultStoreSettingsInput.paymentQrisPayload,
    ),
    paymentMerchantName: normalizeText(
      input.paymentMerchantName,
      defaultStoreSettingsInput.paymentMerchantName,
    ),
    paymentMerchantCity: normalizeText(
      input.paymentMerchantCity,
      defaultStoreSettingsInput.paymentMerchantCity,
    ),
    paymentCheckoutTitle: normalizeText(
      input.paymentCheckoutTitle,
      defaultStoreSettingsInput.paymentCheckoutTitle,
    ),
    paymentCheckoutDescription: normalizeText(
      input.paymentCheckoutDescription,
      defaultStoreSettingsInput.paymentCheckoutDescription,
    ),
    paymentInstructionLines: normalizeStringList(
      input.paymentInstructionLines,
      defaultStoreSettingsInput.paymentInstructionLines,
    ),
    paymentConfirmTitle: normalizeText(
      input.paymentConfirmTitle,
      defaultStoreSettingsInput.paymentConfirmTitle,
    ),
    paymentConfirmDescription: normalizeText(
      input.paymentConfirmDescription,
      defaultStoreSettingsInput.paymentConfirmDescription,
    ),
    paymentSuccessMessage: normalizeText(
      input.paymentSuccessMessage,
      defaultStoreSettingsInput.paymentSuccessMessage,
    ),
    paymentNoteLabel: normalizeText(
      input.paymentNoteLabel,
      defaultStoreSettingsInput.paymentNoteLabel,
    ),
    proofUploadLabel: normalizeText(
      input.proofUploadLabel,
      defaultStoreSettingsInput.proofUploadLabel,
    ),
    paymentConfirmButtonLabel: normalizeText(
      input.paymentConfirmButtonLabel,
      defaultStoreSettingsInput.paymentConfirmButtonLabel,
    ),
    checkoutContinueButtonLabel: normalizeText(
      input.checkoutContinueButtonLabel,
      defaultStoreSettingsInput.checkoutContinueButtonLabel,
    ),
    trackerTitle: normalizeText(
      input.trackerTitle,
      defaultStoreSettingsInput.trackerTitle,
    ),
    operationalNotesTitle: normalizeText(
      input.operationalNotesTitle,
      defaultStoreSettingsInput.operationalNotesTitle,
    ),
    operationalNotesDescription: normalizeText(
      input.operationalNotesDescription,
      defaultStoreSettingsInput.operationalNotesDescription,
    ),
    operationalNotesLines: normalizeStringList(
      input.operationalNotesLines,
      defaultStoreSettingsInput.operationalNotesLines,
    ),
    orderSnapshotTitle: normalizeText(
      input.orderSnapshotTitle,
      defaultStoreSettingsInput.orderSnapshotTitle,
    ),
  };
}
