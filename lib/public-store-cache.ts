import { unstable_cache } from "next/cache";

import { APP_SCHEMA_VERSION } from "@/lib/app-config";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { defaultStoreSettings } from "@/lib/store-settings";
import { normalizeStoreSettingsInput } from "@/lib/store-settings";
import type { Product, StoreSettings, StoreWorkflowStep } from "@/types/domain";

type ProductRow = {
  id: string;
  title: string;
  slug: string | null;
  price: number | string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
};

type StoreSettingsRow = {
  id: string;
  key: string;
  brand_name?: string | null;
  brand_compact_name?: string | null;
  brand_logo_url?: string | null;
  brand_tagline?: string | null;
  header_status_badge?: string | null;
  header_nav_labels?: unknown;
  contact_whatsapp_number?: string | null;
  contact_whatsapp_label?: string | null;
  footer_description?: string | null;
  footer_link_labels?: unknown;
  demo_banner_text?: string | null;
  hero_badge?: string | null;
  hero_title?: string | null;
  hero_description?: string | null;
  hero_primary_cta_label?: string | null;
  hero_secondary_cta_label?: string | null;
  workflow_badge?: string | null;
  workflow_title?: string | null;
  workflow_description?: string | null;
  workflow_steps?: unknown;
  catalog_badge?: string | null;
  catalog_title?: string | null;
  catalog_description?: string | null;
  stack_badge?: string | null;
  stack_highlights?: unknown;
  dashboard_badge?: string | null;
  dashboard_notes?: unknown;
  catalog_status_label?: string | null;
  catalog_status_description?: string | null;
  workflow_status_label?: string | null;
  workflow_status_description?: string | null;
  operations_status_label?: string | null;
  operations_status_title?: string | null;
  operations_status_description?: string | null;
  checkout_eyebrow?: string | null;
  checkout_intro_description?: string | null;
  buyer_form_title?: string | null;
  buyer_form_description?: string | null;
  buyer_ready_title?: string | null;
  buyer_ready_description?: string | null;
  payment_display_label?: string | null;
  payment_qris_payload?: string | null;
  payment_merchant_name?: string | null;
  payment_merchant_city?: string | null;
  payment_checkout_title?: string | null;
  payment_checkout_description?: string | null;
  payment_instruction_lines?: unknown;
  payment_confirm_title?: string | null;
  payment_confirm_description?: string | null;
  payment_success_message?: string | null;
  payment_note_label?: string | null;
  proof_upload_label?: string | null;
  payment_confirm_button_label?: string | null;
  checkout_continue_button_label?: string | null;
  tracker_title?: string | null;
  operational_notes_title?: string | null;
  operational_notes_description?: string | null;
  operational_notes_lines?: unknown;
  order_snapshot_title?: string | null;
  updated_at: string;
};

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug ?? row.id,
    price: toNumber(row.price),
    description: row.description ?? "",
    category: row.category ?? "General",
    imageUrl: row.image_url,
    stock: row.stock,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function normalizeTextListValue(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return fallback.map((fallbackItem, index) => {
    const candidate = value[index];
    return typeof candidate === "string" && candidate.trim()
      ? candidate.trim()
      : fallbackItem;
  });
}

function normalizeWorkflowStepsValue(value: unknown, fallback: StoreWorkflowStep[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return fallback.map((fallbackStep, index) => {
    const candidate = value[index];

    if (!candidate || typeof candidate !== "object") {
      return fallbackStep;
    }

    const title =
      "title" in candidate && typeof candidate.title === "string"
        ? candidate.title.trim()
        : "";
    const description =
      "description" in candidate && typeof candidate.description === "string"
        ? candidate.description.trim()
        : "";

    return {
      title: title || fallbackStep.title,
      description: description || fallbackStep.description,
    };
  });
}

function mapStoreSettings(row: StoreSettingsRow): StoreSettings {
  return {
    id: row.id,
    key: row.key,
    updatedAt: row.updated_at,
    ...normalizeStoreSettingsInput({
      brandName: row.brand_name ?? undefined,
      brandCompactName: row.brand_compact_name ?? undefined,
      brandLogoUrl: row.brand_logo_url ?? undefined,
      brandTagline: row.brand_tagline ?? undefined,
      headerStatusBadge: row.header_status_badge ?? undefined,
      headerNavLabels: normalizeTextListValue(
        row.header_nav_labels,
        defaultStoreSettings.headerNavLabels,
      ),
      contactWhatsappNumber: row.contact_whatsapp_number ?? undefined,
      contactWhatsappLabel: row.contact_whatsapp_label ?? undefined,
      footerDescription: row.footer_description ?? undefined,
      footerLinkLabels: normalizeTextListValue(
        row.footer_link_labels,
        defaultStoreSettings.footerLinkLabels,
      ),
      demoBannerText: row.demo_banner_text ?? undefined,
      heroBadge: row.hero_badge ?? undefined,
      heroTitle: row.hero_title ?? undefined,
      heroDescription: row.hero_description ?? undefined,
      heroPrimaryCtaLabel: row.hero_primary_cta_label ?? undefined,
      heroSecondaryCtaLabel: row.hero_secondary_cta_label ?? undefined,
      workflowBadge: row.workflow_badge ?? undefined,
      workflowTitle: row.workflow_title ?? undefined,
      workflowDescription: row.workflow_description ?? undefined,
      workflowSteps: normalizeWorkflowStepsValue(
        row.workflow_steps,
        defaultStoreSettings.workflowSteps,
      ),
      catalogBadge: row.catalog_badge ?? undefined,
      catalogTitle: row.catalog_title ?? undefined,
      catalogDescription: row.catalog_description ?? undefined,
      stackBadge: row.stack_badge ?? undefined,
      stackHighlights: normalizeTextListValue(
        row.stack_highlights,
        defaultStoreSettings.stackHighlights,
      ),
      dashboardBadge: row.dashboard_badge ?? undefined,
      dashboardNotes: normalizeTextListValue(
        row.dashboard_notes,
        defaultStoreSettings.dashboardNotes,
      ),
      catalogStatusLabel: row.catalog_status_label ?? undefined,
      catalogStatusDescription: row.catalog_status_description ?? undefined,
      workflowStatusLabel: row.workflow_status_label ?? undefined,
      workflowStatusDescription: row.workflow_status_description ?? undefined,
      operationsStatusLabel: row.operations_status_label ?? undefined,
      operationsStatusTitle: row.operations_status_title ?? undefined,
      operationsStatusDescription: row.operations_status_description ?? undefined,
      checkoutEyebrow: row.checkout_eyebrow ?? undefined,
      checkoutIntroDescription: row.checkout_intro_description ?? undefined,
      buyerFormTitle: row.buyer_form_title ?? undefined,
      buyerFormDescription: row.buyer_form_description ?? undefined,
      buyerReadyTitle: row.buyer_ready_title ?? undefined,
      buyerReadyDescription: row.buyer_ready_description ?? undefined,
      paymentDisplayLabel: row.payment_display_label ?? undefined,
      paymentQrisPayload: row.payment_qris_payload ?? undefined,
      paymentMerchantName: row.payment_merchant_name ?? undefined,
      paymentMerchantCity: row.payment_merchant_city ?? undefined,
      paymentCheckoutTitle: row.payment_checkout_title ?? undefined,
      paymentCheckoutDescription: row.payment_checkout_description ?? undefined,
      paymentInstructionLines: normalizeTextListValue(
        row.payment_instruction_lines,
        defaultStoreSettings.paymentInstructionLines,
      ),
      paymentConfirmTitle: row.payment_confirm_title ?? undefined,
      paymentConfirmDescription: row.payment_confirm_description ?? undefined,
      paymentSuccessMessage: row.payment_success_message ?? undefined,
      paymentNoteLabel: row.payment_note_label ?? undefined,
      proofUploadLabel: row.proof_upload_label ?? undefined,
      paymentConfirmButtonLabel: row.payment_confirm_button_label ?? undefined,
      checkoutContinueButtonLabel:
        row.checkout_continue_button_label ?? undefined,
      trackerTitle: row.tracker_title ?? undefined,
      operationalNotesTitle: row.operational_notes_title ?? undefined,
      operationalNotesDescription:
        row.operational_notes_description ?? undefined,
      operationalNotesLines: normalizeTextListValue(
        row.operational_notes_lines,
        defaultStoreSettings.operationalNotesLines,
      ),
      orderSnapshotTitle: row.order_snapshot_title ?? undefined,
    }),
  };
}

const getCachedCatalogProductsInner = unstable_cache(
  async () => {
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return [] as Product[];
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Failed to fetch cached catalog products", error?.message);
      return [] as Product[];
    }

    return (data as ProductRow[]).map(mapProduct);
  },
  [APP_SCHEMA_VERSION, CACHE_TAGS.catalogProducts],
  {
    tags: [CACHE_TAGS.catalogProducts],
    revalidate: 60 * 30,
  },
);

export async function getCachedCatalogProductsFromServiceRole() {
  return getCachedCatalogProductsInner();
}

const getCachedProductBySlugInner = unstable_cache(
  async (normalizedSlug: string) => {
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", normalizedSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("Failed to fetch cached product by slug", error.message);
      }

      return null;
    }

    return mapProduct(data as ProductRow);
  },
  [APP_SCHEMA_VERSION, "product-by-slug"],
  {
    tags: [CACHE_TAGS.catalogProducts],
    revalidate: 60 * 30,
  },
);

export async function getCachedProductBySlugFromServiceRole(slug: string) {
  return getCachedProductBySlugInner(slug.trim().toLowerCase());
}

const getCachedStoreSettingsInner = unstable_cache(
  async () => {
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("key", "default")
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("Failed to fetch cached store settings", error.message);
      }

      return null;
    }

    return mapStoreSettings(data as StoreSettingsRow);
  },
  [APP_SCHEMA_VERSION, CACHE_TAGS.storeSettings],
  {
    tags: [CACHE_TAGS.storeSettings],
    revalidate: 60 * 30,
  },
);

export async function getCachedStoreSettingsFromServiceRole() {
  return getCachedStoreSettingsInner();
}
