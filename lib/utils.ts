import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFirstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function normalizeWhatsappNumber(phone: string) {
  const digits = phone.trim().replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("620")) {
    return `62${digits.slice(3)}`;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

export function formatWhatsappDisplay(phone: string) {
  const normalized = normalizeWhatsappNumber(phone);
  return normalized ? `+${normalized}` : "";
}

export function formatWhatsappHref(phone: string) {
  const normalized = normalizeWhatsappNumber(phone);
  return `https://wa.me/${normalized}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
