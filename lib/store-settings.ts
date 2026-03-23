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

export const defaultStoreSettingsInput: StoreSettingsInput = {
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
  paymentDisplayLabel: "QRIS Statis ARR WARUNG DIGITAL",
  paymentQrisPayload:
    "00020101021126760024ID.CO.SPEEDCASH.MERCHANT01189360081530002045920215ID10250020459260303UKE51440014ID.CO.QRIS.WWW0215ID10254280460520303UKE5204526253033605802ID5918ARR WARUNG DIGITAL6006KENDAL61055138162330509S3443864101091263033620703A016304E9B0",
  paymentMerchantName: "ARR WARUNG DIGITAL",
  paymentMerchantCity: "KENDAL",
  paymentCheckoutTitle: "2. Transfer via QRIS",
  paymentCheckoutDescription:
    "Pakai QRIS statis merchant dulu. Setelah transfer, buyer klik konfirmasi pembayaran di bawah.",
  paymentInstructionLines: defaultPaymentInstructionLines,
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
    paymentDisplayLabel: settings.paymentDisplayLabel,
    paymentQrisPayload: settings.paymentQrisPayload,
    paymentMerchantName: settings.paymentMerchantName,
    paymentMerchantCity: settings.paymentMerchantCity,
    paymentCheckoutTitle: settings.paymentCheckoutTitle,
    paymentCheckoutDescription: settings.paymentCheckoutDescription,
    paymentInstructionLines: settings.paymentInstructionLines,
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
  };
}
