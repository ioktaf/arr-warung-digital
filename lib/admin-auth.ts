import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";
const ADMIN_LOGIN_GUARD_COOKIE_NAME = "admin_login_guard";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const ADMIN_LOGIN_FAILURE_LIMIT = 5;
const ADMIN_LOGIN_BLOCK_TTL_MS = 1000 * 60 * 15;

type AdminLoginGuardState = {
  failures: number;
  blockedUntil: number | null;
};

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

function encodeLoginGuardState(state: AdminLoginGuardState, secret: string) {
  const failures = String(Math.max(0, Math.floor(state.failures)));
  const blockedUntil = state.blockedUntil ? String(state.blockedUntil) : "0";
  const raw = `${failures}.${blockedUntil}`;
  const signature = signValue(raw, secret);
  return `${raw}.${signature}`;
}

function parseLoginGuardState(
  value: string | undefined,
  secret: string | undefined,
): AdminLoginGuardState {
  if (!value || !secret) {
    return {
      failures: 0,
      blockedUntil: null,
    };
  }

  const [failuresRaw, blockedUntilRaw, signature] = value.split(".");

  if (!failuresRaw || !blockedUntilRaw || !signature) {
    return {
      failures: 0,
      blockedUntil: null,
    };
  }

  const raw = `${failuresRaw}.${blockedUntilRaw}`;
  const expectedSignature = signValue(raw, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return {
      failures: 0,
      blockedUntil: null,
    };
  }

  const failures = Number.parseInt(failuresRaw, 10);
  const blockedUntilValue = Number.parseInt(blockedUntilRaw, 10);
  const blockedUntil =
    Number.isFinite(blockedUntilValue) && blockedUntilValue > Date.now()
      ? blockedUntilValue
      : null;

  return {
    failures: Number.isFinite(failures) ? Math.max(0, failures) : 0,
    blockedUntil,
  };
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

export async function getAdminLoginGuardState() {
  const cookieStore = await cookies();
  const { secret } = getAdminAuthEnv();
  const rawState = cookieStore.get(ADMIN_LOGIN_GUARD_COOKIE_NAME)?.value;
  const state = parseLoginGuardState(rawState, secret);

  return {
    ...state,
    isBlocked: Boolean(state.blockedUntil && state.blockedUntil > Date.now()),
  };
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

export async function clearAdminLoginGuardState() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_LOGIN_GUARD_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function registerAdminLoginFailure() {
  const cookieStore = await cookies();
  const { secret } = getAdminAuthEnv();

  if (!secret) {
    return {
      failures: 1,
      blockedUntil: null,
      isBlocked: false,
    };
  }

  const currentState = parseLoginGuardState(
    cookieStore.get(ADMIN_LOGIN_GUARD_COOKIE_NAME)?.value,
    secret,
  );
  const nextFailures = currentState.blockedUntil ? 1 : currentState.failures + 1;
  const blockedUntil =
    nextFailures >= ADMIN_LOGIN_FAILURE_LIMIT
      ? Date.now() + ADMIN_LOGIN_BLOCK_TTL_MS
      : null;

  cookieStore.set(
    ADMIN_LOGIN_GUARD_COOKIE_NAME,
    encodeLoginGuardState(
      {
        failures: nextFailures,
        blockedUntil,
      },
      secret,
    ),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(Date.now() + ADMIN_LOGIN_BLOCK_TTL_MS),
    },
  );

  return {
    failures: nextFailures,
    blockedUntil,
    isBlocked: Boolean(blockedUntil),
  };
}
