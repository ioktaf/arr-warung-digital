"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin-auth";
import { updateStoreSettings } from "@/lib/data";
import { getImageFile, uploadBrandLogo } from "@/lib/storage-assets";
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
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/cart");
  revalidatePath("/track");
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
    brandName: getTextValue(formData.get("brandName")),
    brandCompactName: getTextValue(formData.get("brandCompactName")),
    brandLogoUrl: getTextValue(formData.get("brandLogoUrl")),
    brandTagline: getTextValue(formData.get("brandTagline")),
    headerStatusBadge: getTextValue(formData.get("headerStatusBadge")),
    headerNavLabels: readStringList(
      formData,
      "headerNavLabel",
      defaultStoreSettingsInput.headerNavLabels,
    ),
    contactWhatsappNumber: getTextValue(formData.get("contactWhatsappNumber")),
    contactWhatsappLabel: getTextValue(formData.get("contactWhatsappLabel")),
    footerDescription: getTextValue(formData.get("footerDescription")),
    footerLinkLabels: readStringList(
      formData,
      "footerLinkLabel",
      defaultStoreSettingsInput.footerLinkLabels,
    ),
    demoBannerText: getTextValue(formData.get("demoBannerText")),
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
    catalogStatusLabel: getTextValue(formData.get("catalogStatusLabel")),
    catalogStatusDescription: getTextValue(
      formData.get("catalogStatusDescription"),
    ),
    workflowStatusLabel: getTextValue(formData.get("workflowStatusLabel")),
    workflowStatusDescription: getTextValue(
      formData.get("workflowStatusDescription"),
    ),
    operationsStatusLabel: getTextValue(formData.get("operationsStatusLabel")),
    operationsStatusTitle: getTextValue(formData.get("operationsStatusTitle")),
    operationsStatusDescription: getTextValue(
      formData.get("operationsStatusDescription"),
    ),
    checkoutEyebrow: getTextValue(formData.get("checkoutEyebrow")),
    checkoutIntroDescription: getTextValue(
      formData.get("checkoutIntroDescription"),
    ),
    buyerFormTitle: getTextValue(formData.get("buyerFormTitle")),
    buyerFormDescription: getTextValue(formData.get("buyerFormDescription")),
    buyerReadyTitle: getTextValue(formData.get("buyerReadyTitle")),
    buyerReadyDescription: getTextValue(formData.get("buyerReadyDescription")),
    paymentConfirmTitle: getTextValue(formData.get("paymentConfirmTitle")),
    paymentConfirmDescription: getTextValue(
      formData.get("paymentConfirmDescription"),
    ),
    paymentSuccessMessage: getTextValue(formData.get("paymentSuccessMessage")),
    paymentNoteLabel: getTextValue(formData.get("paymentNoteLabel")),
    proofUploadLabel: getTextValue(formData.get("proofUploadLabel")),
    paymentConfirmButtonLabel: getTextValue(
      formData.get("paymentConfirmButtonLabel"),
    ),
    checkoutContinueButtonLabel: getTextValue(
      formData.get("checkoutContinueButtonLabel"),
    ),
    trackerTitle: getTextValue(formData.get("trackerTitle")),
    operationalNotesTitle: getTextValue(formData.get("operationalNotesTitle")),
    operationalNotesDescription: getTextValue(
      formData.get("operationalNotesDescription"),
    ),
    operationalNotesLines: readStringList(
      formData,
      "operationalNotesLine",
      defaultStoreSettingsInput.operationalNotesLines,
    ),
    orderSnapshotTitle: getTextValue(formData.get("orderSnapshotTitle")),
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

  const nextInput = buildStorefrontSettingsInput(formData);
  const logoFile = getImageFile(formData, "brandLogoFile");

  if (logoFile) {
    const uploadResult = await uploadBrandLogo(
      logoFile,
      nextInput.brandName || defaultStoreSettingsInput.brandName,
    );

    if (!uploadResult.ok) {
      redirectToSettings(uploadResult.message, "danger");
    }

    nextInput.brandLogoUrl = uploadResult.publicUrl;
  }

  const result = await updateStoreSettings(nextInput);

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
