import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { loginAdminAction } from "@/app/admin/login/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { hasAdminAuthEnv, isAdminAuthenticated } from "@/lib/admin-auth";
import { getFirstValue } from "@/lib/utils";

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages = {
  invalid: "Password admin tidak cocok. Coba lagi.",
  "rate-limit":
    "Terlalu banyak percobaan login gagal. Tunggu sekitar 15 menit lalu coba lagi.",
  setup:
    "ADMIN_ACCESS_PASSWORD atau ADMIN_SESSION_SECRET belum diisi di environment.",
} as const;

const noticeMessages = {
  "logged-out": "Sesi admin sudah ditutup.",
} as const;

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const query = await searchParams;
  const errorKey = getFirstValue(query.error);
  const noticeKey = getFirstValue(query.notice);
  const errorMessage =
    errorKey && errorKey in errorMessages
      ? errorMessages[errorKey as keyof typeof errorMessages]
      : null;
  const noticeMessage =
    noticeKey && noticeKey in noticeMessages
      ? noticeMessages[noticeKey as keyof typeof noticeMessages]
      : null;
  const envReady = hasAdminAuthEnv();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef3e6_0%,#f6f1e8_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="brand">Protected Admin</Badge>
            <h1 className="mt-3 text-4xl font-black">Masuk ke workspace admin</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Dashboard admin sekarang dikunci password supaya panel order dan
              edit produk, settings jualan, dan payment control tidak bisa
              dibuka publik begitu saja.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white"
          >
            Kembali ke storefront
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cara akses admin</h2>
                <p className="text-sm leading-7 text-muted">
                  Cukup satu password bersama untuk tahap awal sebelum nanti
                  dinaikkan ke auth yang lebih lengkap.
                </p>
              </div>
            </div>

              <div className="space-y-3 text-sm leading-7 text-muted">
              <p>1. Isi password admin yang disimpan di environment Vercel.</p>
              <p>2. Setelah login, kamu bisa masuk ke board order, panel produk, dan settings storefront.</p>
              <p>3. Terlalu banyak percobaan gagal akan memblok login sementara di browser ini.</p>
              <p>4. Logout akan menutup sesi admin di browser ini.</p>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Login admin</h2>
                <p className="text-sm leading-7 text-muted">
                  Password ini tidak disimpan di code, hanya dibaca dari environment.
                </p>
              </div>
            </div>

            {noticeMessage ? (
              <div className="rounded-[24px] border border-success/20 bg-success/10 px-5 py-4 text-sm text-success">
                {noticeMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-[24px] border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger">
                {errorMessage}
              </div>
            ) : null}

            {!envReady ? (
              <div className="rounded-[24px] border border-accent/20 bg-accent/10 px-5 py-4 text-sm text-accent">
                Isi `ADMIN_ACCESS_PASSWORD` dan `ADMIN_SESSION_SECRET` dulu di env lokal atau Vercel, baru login admin bisa dipakai.
              </div>
            ) : null}

            <form
              action={loginAdminAction}
              className="grid gap-4"
            >
              <label className="grid gap-2 text-sm font-medium">
                Password Admin
                <input
                  type="password"
                  name="password"
                  placeholder="Masukkan password admin"
                  className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
                />
              </label>

              <SubmitButton
                idleLabel="Masuk ke Admin"
                pendingLabel="Memeriksa Password..."
                className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
              />
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
