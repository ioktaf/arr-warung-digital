import Link from "next/link";
import { Download, ShieldCheck, Siren, Telescope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSystemHealthSnapshot } from "@/lib/system-health";

const toneClasses = {
  success: "text-success",
  danger: "text-danger",
  accent: "text-accent",
} as const;

export default async function AdminSystemPage() {
  const snapshot = await getSystemHealthSnapshot();
  const healthyCount = snapshot.checks.filter((check) => check.ok).length;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="brand">System</Badge>
          <h2 className="mt-3 text-4xl font-black">Monitoring, health, dan backup</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Halaman ini dipakai untuk cek sinkronisasi schema, bucket storage,
            env notifikasi, audit log admin, dan download backup JSON manual.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/system/backup"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            <Download className="h-4 w-4" />
            Download JSON Backup
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <Badge tone="brand">{healthyCount}/{snapshot.checks.length} OK</Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Schema
          </p>
          <p className="mt-2 text-3xl font-black">{snapshot.schemaVersion}</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Target app saat ini {snapshot.expectedSchemaVersion}.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Telescope className="h-5 w-5 text-accent" />
            <Badge tone={snapshot.supabaseProjectUrl ? "accent" : "danger"}>
              {snapshot.supabaseProjectUrl ? "Linked" : "Missing"}
            </Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Supabase
          </p>
          <p className="mt-2 text-xl font-black">
            {snapshot.supabaseProjectUrl ? "Connected" : "Not Ready"}
          </p>
          <p className="mt-2 break-all text-sm leading-7 text-muted">
            {snapshot.supabaseProjectUrl ?? "NEXT_PUBLIC_SUPABASE_URL belum diisi."}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Siren className="h-5 w-5 text-danger" />
            <Badge tone={snapshot.recentEvents.length ? "danger" : "success"}>
              {snapshot.recentEvents.length} event
            </Badge>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted">
            Monitoring
          </p>
          <p className="mt-2 text-xl font-black">
            {snapshot.recentEvents.length ? "Perlu dicek" : "Tenang"}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted">
            System events akan mencatat kegagalan upload, notifikasi, atau issue operasional lain.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5">
          <div>
            <Badge>Checklist Runtime</Badge>
            <h3 className="mt-3 text-2xl font-black">Status health detail</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {snapshot.checks.map((check) => (
              <div
                key={check.id}
                className="rounded-[24px] border border-line bg-white/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{check.label}</p>
                  <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${toneClasses[check.tone]}`}>
                    {check.ok ? "OK" : "Check"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted">{check.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <Badge tone="brand">Backup SOP</Badge>
              <h3 className="mt-3 text-2xl font-black">Cadangan manual paling aman</h3>
            </div>
            <div className="space-y-3 text-sm leading-7 text-muted">
              <p>1. Download JSON backup sebelum ubah schema besar atau promo massal.</p>
              <p>2. Simpan salinan di Google Drive atau folder terpisah per tanggal.</p>
              <p>3. Untuk backup tambahan, export table penting dari Supabase sepekan sekali.</p>
              <p>4. Saat restore nanti, file ini mempermudah re-import data penting walau migrasi berubah.</p>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <Badge tone="accent">Audit Admin</Badge>
              <h3 className="mt-3 text-2xl font-black">Aktivitas terbaru</h3>
            </div>
            <div className="space-y-3 text-sm leading-7 text-muted">
              {snapshot.recentActivity.length ? (
                snapshot.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-[20px] border border-line bg-white/70 px-4 py-3"
                  >
                    <p className="font-semibold text-foreground">{activity.summary}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                      {activity.action} · {new Date(activity.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              ) : (
                <p>Belum ada activity log tersimpan.</p>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <Badge tone="danger">System Events</Badge>
              <h3 className="mt-3 text-2xl font-black">Error dan warning terbaru</h3>
            </div>
            <div className="space-y-3 text-sm leading-7 text-muted">
              {snapshot.recentEvents.length ? (
                snapshot.recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[20px] border border-line bg-white/70 px-4 py-3"
                  >
                    <p className="font-semibold text-foreground">{event.message}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                      {event.source} · {event.severity} · {new Date(event.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              ) : (
                <p>Belum ada error yang terekam. Ini pertanda bagus.</p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
