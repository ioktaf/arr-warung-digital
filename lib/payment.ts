import { cache } from "react";
import QRCode from "qrcode";

export const paymentConfig = {
  qrisPayload:
    "00020101021126760024ID.CO.SPEEDCASH.MERCHANT01189360081530002045920215ID10250020459260303UKE51440014ID.CO.QRIS.WWW0215ID10254280460520303UKE5204526253033605802ID5918ARR WARUNG DIGITAL6006KENDAL61055138162330509S3443864101091263033620703A016304E9B0",
  merchantName: "ARR WARUNG DIGITAL",
  merchantCity: "KENDAL",
  displayLabel: "QRIS Statis ARR WARUNG DIGITAL",
} as const;

const generateQrisDataUrl = cache(async () => {
  try {
    return await QRCode.toDataURL(paymentConfig.qrisPayload, {
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

export async function getQrisImageDataUrl() {
  return generateQrisDataUrl();
}
