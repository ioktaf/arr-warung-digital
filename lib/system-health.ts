import { APP_SCHEMA_VERSION, REQUIRED_RUNTIME_TABLES, REQUIRED_STORAGE_BUCKETS } from "@/lib/app-config";
import { getRecentAdminActivities } from "@/lib/admin-audit";
import { hasAdminAuthEnv } from "@/lib/admin-auth";
import { getSupabaseEnv, hasPublicSupabaseEnv, hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRecentSystemEvents } from "@/lib/system-events";
import { hasTelegramNotificationEnv } from "@/lib/telegram";

export type HealthStatusTone = "success" | "danger" | "accent";

export type SystemHealthCheck = {
  id: string;
  label: string;
  description: string;
  ok: boolean;
  tone: HealthStatusTone;
};

export async function getSystemHealthSnapshot() {
  const checks: SystemHealthCheck[] = [
    {
      id: "supabase-public-env",
      label: "Supabase Public Env",
      description: hasPublicSupabaseEnv()
        ? "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY terisi."
        : "Isi env public Supabase agar storefront live bisa baca data.",
      ok: hasPublicSupabaseEnv(),
      tone: hasPublicSupabaseEnv() ? "success" : "danger",
    },
    {
      id: "supabase-service-env",
      label: "Supabase Service Env",
      description: hasServiceRoleSupabaseEnv()
        ? "SUPABASE_SERVICE_ROLE_KEY aktif untuk admin, upload, dan backup."
        : "Isi service role key untuk fitur admin penuh, storage, dan backup export.",
      ok: hasServiceRoleSupabaseEnv(),
      tone: hasServiceRoleSupabaseEnv() ? "success" : "danger",
    },
    {
      id: "admin-auth-env",
      label: "Admin Auth",
      description: hasAdminAuthEnv()
        ? "Password admin dan secret sesi sudah aktif."
        : "Isi ADMIN_ACCESS_PASSWORD dan ADMIN_SESSION_SECRET.",
      ok: hasAdminAuthEnv(),
      tone: hasAdminAuthEnv() ? "success" : "danger",
    },
    {
      id: "telegram-notify-env",
      label: "Telegram Notification",
      description: hasTelegramNotificationEnv()
        ? "Notifikasi Telegram siap dipakai."
        : "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diisi. Fitur notif masih idle.",
      ok: hasTelegramNotificationEnv(),
      tone: hasTelegramNotificationEnv() ? "success" : "accent",
    },
  ];

  let schemaVersion = "unknown";
  let bucketNames: string[] = [];

  if (hasServiceRoleSupabaseEnv()) {
    const supabase = createSupabaseAdminClient();

    if (supabase) {
      const { data: metaRows } = await supabase
        .from("app_runtime_meta")
        .select("key, value_text")
        .eq("key", "schema_version")
        .limit(1);

      const { data: buckets } = await supabase.storage.listBuckets();
      bucketNames = (buckets ?? []).map((bucket) => bucket.name);
      schemaVersion =
        metaRows?.find((row) => row.key === "schema_version")?.value_text ?? "missing";

      const tableChecks = await Promise.all(
        REQUIRED_RUNTIME_TABLES.map(async (tableName) => {
          const { error } = await supabase.from(tableName).select("*").limit(1);
          return {
            tableName,
            ok: !error,
          };
        }),
      );

      tableChecks.forEach((tableCheck) => {
        checks.push({
          id: `table-${tableCheck.tableName}`,
          label: `Table ${tableCheck.tableName}`,
          description: tableCheck.ok
            ? "Table ini siap dipakai oleh fitur live."
            : "Table belum siap atau schema belum sinkron.",
          ok: tableCheck.ok,
          tone: tableCheck.ok ? "success" : "danger",
        });
      });
    }
  }

  checks.push({
    id: "schema-version",
    label: "Schema Version",
    description:
      schemaVersion === APP_SCHEMA_VERSION
        ? `Schema live sinkron dengan versi app ${APP_SCHEMA_VERSION}.`
        : `Versi app menunggu ${APP_SCHEMA_VERSION}, live saat ini ${schemaVersion}. Jalankan schema.sql terbaru.`,
    ok: schemaVersion === APP_SCHEMA_VERSION,
    tone: schemaVersion === APP_SCHEMA_VERSION ? "success" : "danger",
  });

  REQUIRED_STORAGE_BUCKETS.forEach((bucketName) => {
    const ok = bucketNames.includes(bucketName);

    checks.push({
      id: `bucket-${bucketName}`,
      label: `Bucket ${bucketName}`,
      description: ok
        ? "Bucket storage tersedia."
        : "Bucket belum ada di Supabase Storage.",
      ok,
      tone: ok ? "success" : "danger",
    });
  });

  const recentActivity = await getRecentAdminActivities(10);
  const recentEvents = await getRecentSystemEvents(10);
  const { url } = getSupabaseEnv();

  return {
    schemaVersion,
    expectedSchemaVersion: APP_SCHEMA_VERSION,
    supabaseProjectUrl: url ?? null,
    checks,
    recentActivity,
    recentEvents,
  };
}
