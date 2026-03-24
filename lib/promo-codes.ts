import {
  createMockPromoCode,
  deleteMockPromoCode,
  mockPromoCodes,
  setMockPromoCodeActive,
  updateMockPromoCode,
} from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import type {
  PromoCode,
  PromoCodeDraft,
  PromoDiscountType,
} from "@/types/domain";

type PromoCodeRow = {
  id: string;
  code: string;
  label: string | null;
  description: string | null;
  discount_type: PromoDiscountType;
  discount_value: number | string;
  minimum_subtotal: number | string | null;
  max_discount: number | string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ResolvePromoCodeResult =
  | {
      ok: true;
      promo: PromoCode | null;
      discountAmount: number;
      normalizedCode: string;
    }
  | {
      ok: false;
      message: string;
      normalizedCode: string;
    };

export type PromoMutationResult =
  | {
      ok: true;
      mode: "live" | "mock";
      promo: PromoCode | null;
    }
  | {
      ok: false;
      mode: "live" | "mock";
      message: string;
      promo?: PromoCode | null;
    };

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseFloat(value);
  }

  return 0;
}

function mapPromoCode(row: PromoCodeRow): PromoCode {
  const label = row.label?.trim() || row.code;

  return {
    id: row.id,
    code: row.code,
    label,
    description: row.description ?? "",
    discountType: row.discount_type,
    discountValue: Math.max(0, toNumber(row.discount_value)),
    minimumSubtotal: Math.max(0, toNumber(row.minimum_subtotal)),
    maxDiscount:
      row.max_discount === null || row.max_discount === undefined
        ? null
        : Math.max(0, toNumber(row.max_discount)),
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizePromoCodeValue(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function normalizePromoDraft(input: PromoCodeDraft): PromoCodeDraft {
  const code = normalizePromoCodeValue(input.code);
  const label = input.label.trim() || code;

  return {
    code,
    label,
    description: input.description.trim(),
    discountType: input.discountType,
    discountValue: Math.max(0, Math.round(input.discountValue)),
    minimumSubtotal: Math.max(0, Math.round(input.minimumSubtotal)),
    maxDiscount:
      input.maxDiscount === null
        ? null
        : Math.max(0, Math.round(input.maxDiscount)),
    isActive: input.isActive,
  };
}

function validatePromoDraft(input: PromoCodeDraft) {
  if (!input.code) {
    return "Kode promo wajib diisi.";
  }

  if (!input.label) {
    return "Label promo wajib diisi.";
  }

  if (!Number.isFinite(input.discountValue) || input.discountValue <= 0) {
    return "Nilai diskon promo harus lebih besar dari 0.";
  }

  if (input.discountType === "percent" && input.discountValue > 100) {
    return "Diskon persen maksimal 100.";
  }

  return null;
}

function calculatePromoDiscountAmount(promo: PromoCode, subtotal: number) {
  if (subtotal <= 0) {
    return 0;
  }

  const minimumSubtotal = Math.max(0, promo.minimumSubtotal);

  if (subtotal < minimumSubtotal) {
    return 0;
  }

  const rawDiscount =
    promo.discountType === "percent"
      ? Math.round((subtotal * promo.discountValue) / 100)
      : promo.discountValue;

  const cappedDiscount =
    promo.maxDiscount !== null
      ? Math.min(rawDiscount, promo.maxDiscount)
      : rawDiscount;

  return Math.max(0, Math.min(cappedDiscount, subtotal));
}

function getDuplicatePromoMessage(message: string | undefined, fallback: string) {
  if (!message) {
    return fallback;
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("promo_codes_code_key") ||
    (normalized.includes("duplicate key") && normalized.includes("code"))
  ) {
    return "Kode promo sudah dipakai. Gunakan kode lain.";
  }

  return fallback;
}

export function isMissingPromoSchemaError(message: string | undefined) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();

  return (
    normalized.includes("promo") &&
    (normalized.includes("schema cache") ||
      normalized.includes("does not exist") ||
      normalized.includes("relation") ||
      normalized.includes("column") ||
      normalized.includes("table"))
  );
}

export function getMissingPromoSchemaMessage() {
  return "Schema promo belum aktif di Supabase. Jalankan schema.sql terbaru lalu coba lagi.";
}

export async function getAdminPromoCodes() {
  if (!hasServiceRoleSupabaseEnv()) {
    return [...mockPromoCodes].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [...mockPromoCodes].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch promo codes", error?.message);
    return [...mockPromoCodes].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }

  return (data as PromoCodeRow[]).map(mapPromoCode);
}

export async function resolvePromoCodeForSubtotal(
  inputCode: string,
  subtotal: number,
): Promise<ResolvePromoCodeResult> {
  const normalizedCode = normalizePromoCodeValue(inputCode);

  if (!normalizedCode) {
    return {
      ok: true,
      promo: null,
      discountAmount: 0,
      normalizedCode,
    };
  }

  let promo: PromoCode | null = null;

  if (!hasServiceRoleSupabaseEnv()) {
    promo =
      mockPromoCodes.find(
        (item) => item.code === normalizedCode && item.isActive,
      ) ?? null;
  } else {
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      promo =
        mockPromoCodes.find(
          (item) => item.code === normalizedCode && item.isActive,
        ) ?? null;
    } else {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", normalizedCode)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Failed to resolve promo code", error.message);
        return {
          ok: false,
          normalizedCode,
          message: isMissingPromoSchemaError(error.message)
            ? getMissingPromoSchemaMessage()
            : "Kode promo belum bisa dipakai saat ini. Coba lagi sebentar.",
        };
      }

      promo = data ? mapPromoCode(data as PromoCodeRow) : null;
    }
  }

  if (!promo) {
    return {
      ok: false,
      normalizedCode,
      message: "Kode promo tidak ditemukan atau sedang nonaktif.",
    };
  }

  if (subtotal < promo.minimumSubtotal) {
    return {
      ok: false,
      normalizedCode,
      message: `Promo ${promo.code} baru bisa dipakai mulai subtotal Rp${new Intl.NumberFormat("id-ID").format(promo.minimumSubtotal)}.`,
    };
  }

  const discountAmount = calculatePromoDiscountAmount(promo, subtotal);

  if (discountAmount <= 0) {
    return {
      ok: false,
      normalizedCode,
      message: "Kode promo belum memenuhi syarat untuk order ini.",
    };
  }

  return {
    ok: true,
    promo,
    discountAmount,
    normalizedCode,
  };
}

export async function createPromoCode(
  input: PromoCodeDraft,
): Promise<PromoMutationResult> {
  const normalized = normalizePromoDraft(input);
  const validationMessage = validatePromoDraft(normalized);

  if (validationMessage) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: validationMessage,
    };
  }

  if (!hasServiceRoleSupabaseEnv()) {
    return {
      ok: true,
      mode: "mock",
      promo: createMockPromoCode(normalized),
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: true,
      mode: "mock",
      promo: createMockPromoCode(normalized),
    };
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: normalized.code,
      label: normalized.label,
      description: normalized.description || null,
      discount_type: normalized.discountType,
      discount_value: normalized.discountValue,
      minimum_subtotal: normalized.minimumSubtotal,
      max_discount: normalized.maxDiscount,
      is_active: normalized.isActive,
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to create promo code", error?.message);
    return {
      ok: false,
      mode: "live",
      message: isMissingPromoSchemaError(error?.message)
        ? getMissingPromoSchemaMessage()
        : getDuplicatePromoMessage(
            error?.message,
            "Kode promo gagal ditambahkan. Coba lagi sebentar.",
          ),
    };
  }

  return {
    ok: true,
    mode: "live",
    promo: mapPromoCode(data as PromoCodeRow),
  };
}

export async function updatePromoCode(
  promoId: string,
  input: PromoCodeDraft,
): Promise<PromoMutationResult> {
  const normalized = normalizePromoDraft(input);
  const validationMessage = validatePromoDraft(normalized);

  if (!promoId || validationMessage) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: validationMessage ?? "Promo tidak ditemukan.",
    };
  }

  if (!hasServiceRoleSupabaseEnv()) {
    return {
      ok: true,
      mode: "mock",
      promo: updateMockPromoCode(promoId, normalized),
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: true,
      mode: "mock",
      promo: updateMockPromoCode(promoId, normalized),
    };
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .update({
      code: normalized.code,
      label: normalized.label,
      description: normalized.description || null,
      discount_type: normalized.discountType,
      discount_value: normalized.discountValue,
      minimum_subtotal: normalized.minimumSubtotal,
      max_discount: normalized.maxDiscount,
      is_active: normalized.isActive,
    })
    .eq("id", promoId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update promo code", error?.message);
    return {
      ok: false,
      mode: "live",
      message: isMissingPromoSchemaError(error?.message)
        ? getMissingPromoSchemaMessage()
        : getDuplicatePromoMessage(
            error?.message,
            "Promo gagal diperbarui. Coba lagi sebentar.",
          ),
    };
  }

  return {
    ok: true,
    mode: "live",
    promo: mapPromoCode(data as PromoCodeRow),
  };
}

export async function setPromoCodeActive(
  promoId: string,
  isActive: boolean,
): Promise<PromoMutationResult> {
  if (!promoId) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: "Promo tidak ditemukan.",
    };
  }

  if (!hasServiceRoleSupabaseEnv()) {
    return {
      ok: true,
      mode: "mock",
      promo: setMockPromoCodeActive(promoId, isActive),
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: true,
      mode: "mock",
      promo: setMockPromoCodeActive(promoId, isActive),
    };
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .update({ is_active: isActive })
    .eq("id", promoId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to toggle promo code", error?.message);
    return {
      ok: false,
      mode: "live",
      message: isMissingPromoSchemaError(error?.message)
        ? getMissingPromoSchemaMessage()
        : "Status promo gagal diubah. Coba lagi sebentar.",
    };
  }

  return {
    ok: true,
    mode: "live",
    promo: mapPromoCode(data as PromoCodeRow),
  };
}

export async function deletePromoCode(promoId: string): Promise<PromoMutationResult> {
  if (!promoId) {
    return {
      ok: false,
      mode: hasServiceRoleSupabaseEnv() ? "live" : "mock",
      message: "Promo tidak ditemukan.",
    };
  }

  if (!hasServiceRoleSupabaseEnv()) {
    return {
      ok: true,
      mode: "mock",
      promo: deleteMockPromoCode(promoId),
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: true,
      mode: "mock",
      promo: deleteMockPromoCode(promoId),
    };
  }

  const { data: currentData, error: currentError } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("id", promoId)
    .maybeSingle();

  if (currentError) {
    console.error("Failed to fetch promo code before delete", currentError.message);
  }

  const { error } = await supabase.from("promo_codes").delete().eq("id", promoId);

  if (error) {
    console.error("Failed to delete promo code", error.message);
    return {
      ok: false,
      mode: "live",
      promo: currentData ? mapPromoCode(currentData as PromoCodeRow) : null,
      message: isMissingPromoSchemaError(error.message)
        ? getMissingPromoSchemaMessage()
        : "Promo gagal dihapus. Coba lagi sebentar.",
    };
  }

  return {
    ok: true,
    mode: "live",
    promo: currentData ? mapPromoCode(currentData as PromoCodeRow) : null,
  };
}
