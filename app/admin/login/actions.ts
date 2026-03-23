"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  hasAdminAuthEnv,
  isValidAdminPassword,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

function getTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAdminAction(formData: FormData) {
  const password = getTextValue(formData.get("password"));

  if (!hasAdminAuthEnv()) {
    redirect("/admin/login?error=setup");
  }

  if (!isValidAdminPassword(password)) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login?notice=logged-out");
}
