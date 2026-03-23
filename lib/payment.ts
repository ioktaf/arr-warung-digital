import { cache } from "react";
import QRCode from "qrcode";

import { defaultStoreSettingsInput } from "@/lib/store-settings";

type EmvField = {
  id: string;
  value: string;
};

function formatField(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function parseEmvPayload(payload: string) {
  const fields: EmvField[] = [];
  let cursor = 0;

  while (cursor < payload.length) {
    const id = payload.slice(cursor, cursor + 2);
    const lengthText = payload.slice(cursor + 2, cursor + 4);
    const length = Number.parseInt(lengthText, 10);

    if (!id || !lengthText || Number.isNaN(length)) {
      return null;
    }

    const valueStart = cursor + 4;
    const valueEnd = valueStart + length;
    const value = payload.slice(valueStart, valueEnd);

    if (value.length !== length) {
      return null;
    }

    fields.push({ id, value });
    cursor = valueEnd;
  }

  return fields;
}

function upsertField(
  fields: EmvField[],
  nextField: EmvField,
  preferredAfterId?: string,
) {
  const existingIndex = fields.findIndex((field) => field.id === nextField.id);

  if (existingIndex >= 0) {
    fields[existingIndex] = nextField;
    return fields;
  }

  const afterIndex = preferredAfterId
    ? fields.findIndex((field) => field.id === preferredAfterId)
    : -1;

  if (afterIndex >= 0) {
    fields.splice(afterIndex + 1, 0, nextField);
    return fields;
  }

  fields.push(nextField);
  return fields;
}

function formatTransactionAmount(amount: number) {
  return Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.?0+$/, "");
}

function calculateCrc16Ccitt(content: string) {
  let crc = 0xffff;

  for (let index = 0; index < content.length; index += 1) {
    crc ^= content.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildQrisPayload(
  basePayload = defaultStoreSettingsInput.paymentQrisPayload,
  amount?: number,
) {
  if (!amount || amount <= 0) {
    return basePayload;
  }

  const parsedFields = parseEmvPayload(basePayload);

  if (!parsedFields?.length) {
    return basePayload;
  }

  const fields = parsedFields.filter((field) => field.id !== "63");
  const amountValue = formatTransactionAmount(amount);

  upsertField(fields, { id: "01", value: "12" }, "00");

  const countryCodeIndex = fields.findIndex((field) => field.id === "58");
  const amountFieldIndex = fields.findIndex((field) => field.id === "54");
  const amountField = { id: "54", value: amountValue };

  if (amountFieldIndex >= 0) {
    fields[amountFieldIndex] = amountField;
  } else if (countryCodeIndex >= 0) {
    fields.splice(countryCodeIndex, 0, amountField);
  } else {
    fields.push(amountField);
  }

  const withoutCrc = fields.map((field) => formatField(field.id, field.value)).join("");
  const crcSeed = `${withoutCrc}6304`;
  const crc = calculateCrc16Ccitt(crcSeed);

  return `${crcSeed}${crc}`;
}

const generateQrisDataUrl = cache(async (payload: string, amount?: number) => {
  const normalizedPayload = buildQrisPayload(payload, amount);

  try {
    return await QRCode.toDataURL(normalizedPayload, {
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
  amount?: number,
) {
  return generateQrisDataUrl(payload, amount);
}
