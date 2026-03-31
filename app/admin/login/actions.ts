"use server";

import { redirect } from "next/navigation";

import {
  clearAdminLoginGuardState,
  clearAdminSessionCookie,
  getAdminLoginGuardState,
  hasAdminAuthEnv,
  isValidAdminPassword,
  registerAdminLoginFailure,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { recordAdminActivity } from "@/lib/admin-audit";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAdminAction(formData: FormData) {
  const password = getTextValue(formData.get("password"));

  if (!hasAdminAuthEnv()) {
    redirect("/admin/login?error=setup");
  }

  const guardState = await getAdminLoginGuardState();

  if (guardState.isBlocked) {
    redirect("/admin/login?error=rate-limit");
  }

  if (!isValidAdminPassword(password)) {
    const nextState = await registerAdminLoginFailure();

    await recordAdminActivity({
      action: "login_failed",
      targetType: "admin_auth",
      summary: nextState.isBlocked
        ? "Percobaan login admin diblokir sementara karena terlalu banyak gagal."
        : "Percobaan login admin gagal.",
      details: {
        failures: nextState.failures,
        blockedUntil: nextState.blockedUntil,
      },
    });

    if (nextState.isBlocked) {
      redirect("/admin/login?error=rate-limit");
    }

    redirect("/admin/login?error=invalid");
  }

  await clearAdminLoginGuardState();
  await setAdminSessionCookie();
  await recordAdminActivity({
    action: "login_success",
    targetType: "admin_auth",
    summary: "Admin berhasil login ke dashboard.",
  });
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  await recordAdminActivity({
    action: "logout",
    targetType: "admin_auth",
    summary: "Admin logout dari dashboard.",
  });
  redirect("/admin/login?notice=logged-out");
}
