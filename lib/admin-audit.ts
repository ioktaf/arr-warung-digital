import { ADMIN_ACTIVITY_ACTOR_LABEL } from "@/lib/app-config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";

export type AdminActivityLog = {
  id: string;
  actorLabel: string;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  details: Record<string, unknown>;
  createdAt: string;
};

type AdminActivityLogRow = {
  id: string;
  actor_label: string;
  action: string;
  target_type: string;
  target_id: string | null;
  summary: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

type RecordAdminActivityInput = {
  action: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  details?: Record<string, unknown>;
  actorLabel?: string;
};

function mapAdminActivityLog(row: AdminActivityLogRow): AdminActivityLog {
  return {
    id: row.id,
    actorLabel: row.actor_label,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    summary: row.summary,
    details: row.details ?? {},
    createdAt: row.created_at,
  };
}

export async function recordAdminActivity(input: RecordAdminActivityInput) {
  if (!hasServiceRoleSupabaseEnv()) {
    console.info("[admin-audit:mock]", input.summary);
    return false;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    console.info("[admin-audit:no-client]", input.summary);
    return false;
  }

  const { error } = await supabase.from("admin_activity_logs").insert({
    actor_label: input.actorLabel ?? ADMIN_ACTIVITY_ACTOR_LABEL,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    summary: input.summary,
    details: input.details ?? {},
  });

  if (error) {
    console.error("Failed to record admin activity", error.message);
    return false;
  }

  return true;
}

export async function getRecentAdminActivities(limit = 12) {
  if (!hasServiceRoleSupabaseEnv()) {
    return [] as AdminActivityLog[];
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [] as AdminActivityLog[];
  }

  const { data, error } = await supabase
    .from("admin_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Failed to fetch admin activity logs", error?.message);
    return [] as AdminActivityLog[];
  }

  return (data as AdminActivityLogRow[]).map(mapAdminActivityLog);
}
