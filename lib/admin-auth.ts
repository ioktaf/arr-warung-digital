import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_SESSION_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getAdminAuthEnv() {
  return {
    password: process.env.ADMIN_ACCESS_PASSWORD,
    secret: process.env.ADMIN_SESSION_SECRET,
  };
}

function signValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hasAdminAuthEnv() {
  const { password, secret } = getAdminAuthEnv();
  return Boolean(password && secret);
}

export function isValidAdminPassword(candidate: string) {
  const { password, secret } = getAdminAuthEnv();

  if (!password || !secret || !candidate) {
    return false;
  }

  const expected = signValue(password, secret);
  const actual = signValue(candidate, secret);
  return safeEqual(actual, expected);
}

export function createAdminSessionToken() {
  const { secret } = getAdminAuthEnv();

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET belum diisi.");
  }

  const expiresAt = String(Date.now() + ADMIN_SESSION_TTL_MS);
  const signature = signValue(expiresAt, secret);
  return `${expiresAt}.${signature}`;
}

export function isValidAdminSessionToken(token: string | null | undefined) {
  const { secret } = getAdminAuthEnv();

  if (!token || !secret) {
    return false;
  }

  const [expiresAt, signature] = token.split(".");

  if (!expiresAt || !signature) {
    return false;
  }

  const expiresAtNumber = Number.parseInt(expiresAt, 10);

  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber <= Date.now()) {
    return false;
  }

  const expectedSignature = signValue(expiresAt, secret);
  return safeEqual(signature, expectedSignature);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return isValidAdminSessionToken(sessionToken);
}

export async function requireAdminSession() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
