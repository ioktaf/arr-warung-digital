"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin-auth";
import { updateStoreSettings } from "@/lib/data";
import { defaultStoreSettingsInput } from "@/lib/store-settings";
import type { StoreSettingsInput, StoreWorkflowStep } from "@/types/domain";

type NoticeTone = "success" | "danger" | "accent";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectToSettings(notice: string, tone: NoticeTone = "success"): never {
  const searchParams = new URLSearchParams({ notice, tone });
  redirect(`/admin/settings?${searchParams.toString()}`);
}

function revalidateSettingsRoutes() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/checkout/[slug]", "page");
}

function readWorkflowSteps(formData: FormData): StoreWorkflowStep[] {
  return defaultStoreSettingsInput.workflowSteps.map((fallbackStep, index) => ({
    title:
      getTextValue(formData.get(`workflowStepTitle${index + 1}`)) ||
      fallbackStep.title,
    description:
      getTextValue(formData.get(`workflowStepDescription${index + 1}`)) ||
      fallbackStep.description,
  }));
}

function readStringList(
  formData: FormData,
  fieldPrefix: string,
  fallback: string[],
) {
  return fallback.map((fallbackValue, index) => {
    return getTextValue(formData.get(`${fieldPrefix}${index + 1}`)) || fallbackValue;
  });
}

function buildStorefrontSettingsInput(
  formData: FormData,
): Partial<StoreSettingsInput> {
  return {
    heroBadge: getTextValue(formData.get("heroBadge")),
    heroTitle: getTextValue(formData.get("heroTitle")),
    heroDescription: getTextValue(formData.get("heroDescription")),
    heroPrimaryCtaLabel: getTextValue(formData.get("heroPrimaryCtaLabel")),
    heroSecondaryCtaLabel: getTextValue(formData.get("heroSecondaryCtaLabel")),
    workflowBadge: getTextValue(formData.get("workflowBadge")),
    workflowTitle: getTextValue(formData.get("workflowTitle")),
    workflowDescription: getTextValue(formData.get("workflowDescription")),
    workflowSteps: readWorkflowSteps(formData),
    catalogBadge: getTextValue(formData.get("catalogBadge")),
    catalogTitle: getTextValue(formData.get("catalogTitle")),
    catalogDescription: getTextValue(formData.get("catalogDescription")),
    stackBadge: getTextValue(formData.get("stackBadge")),
    stackHighlights: readStringList(
      formData,
      "stackHighlight",
      defaultStoreSettingsInput.stackHighlights,
    ),
    dashboardBadge: getTextValue(formData.get("dashboardBadge")),
    dashboardNotes: readStringList(
      formData,
      "dashboardNote",
      defaultStoreSettingsInput.dashboardNotes,
    ),
  };
}

function buildPaymentSettingsInput(
  formData: FormData,
): Partial<StoreSettingsInput> {
  return {
    paymentDisplayLabel: getTextValue(formData.get("paymentDisplayLabel")),
    paymentMerchantName: getTextValue(formData.get("paymentMerchantName")),
    paymentMerchantCity: getTextValue(formData.get("paymentMerchantCity")),
    paymentQrisPayload: getTextValue(formData.get("paymentQrisPayload")),
    paymentCheckoutTitle: getTextValue(formData.get("paymentCheckoutTitle")),
    paymentCheckoutDescription: getTextValue(
      formData.get("paymentCheckoutDescription"),
    ),
    paymentInstructionLines: readStringList(
      formData,
      "paymentInstructionLine",
      defaultStoreSettingsInput.paymentInstructionLines,
    ),
  };
}

export async function updateStorefrontSettingsAction(formData: FormData) {
  await requireAdminSession();

  const result = await updateStoreSettings(buildStorefrontSettingsInput(formData));

  if (!result.ok) {
    redirectToSettings(
      result.message ?? "Pengaturan storefront gagal disimpan.",
      "danger",
    );
  }

  revalidateSettingsRoutes();
  redirectToSettings(
    result.mode === "mock"
      ? "Pengaturan storefront tersimpan di mode demo. Supabase live belum aktif penuh."
      : "Pengaturan storefront berhasil diperbarui.",
    result.mode === "mock" ? "accent" : "success",
  );
}

export async function updatePaymentSettingsAction(formData: FormData) {
  await requireAdminSession();

  const result = await updateStoreSettings(buildPaymentSettingsInput(formData));

  if (!result.ok) {
    redirectToSettings(
      result.message ?? "Pengaturan pembayaran gagal disimpan.",
      "danger",
    );
  }

  revalidateSettingsRoutes();
  redirectToSettings(
    result.mode === "mock"
      ? "Pengaturan pembayaran tersimpan di mode demo. Supabase live belum aktif penuh."
      : "Pengaturan pembayaran berhasil diperbarui.",
    result.mode === "mock" ? "accent" : "success",
  );
}
