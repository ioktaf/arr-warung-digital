import { cache } from "react";
import QRCode from "qrcode";

import { defaultStoreSettingsInput } from "@/lib/store-settings";

const generateQrisDataUrl = cache(async (payload: string) => {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 960,
      color: {
        dark: "#111111",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("Failed to generate QRIS data URL", error);
    return null;
  }
});

export async function getQrisImageDataUrl(
  payload = defaultStoreSettingsInput.paymentQrisPayload,
) {
  return generateQrisDataUrl(payload);
}
