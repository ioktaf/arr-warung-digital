import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";

export type SystemEventSeverity = "info" | "warning" | "error";

export type SystemEvent = {
  id: string;
  source: string;
  severity: SystemEventSeverity;
  message: string;
  details: Record<string, unknown>;
  createdAt: string;
};

type SystemEventRow = {
  id: string;
  source: string;
  severity: SystemEventSeverity;
  message: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

type RecordSystemEventInput = {
  source: string;
  severity: SystemEventSeverity;
  message: string;
  details?: Record<string, unknown>;
};

function mapSystemEvent(row: SystemEventRow): SystemEvent {
  return {
    id: row.id,
    source: row.source,
    severity: row.severity,
    message: row.message,
    details: row.details ?? {},
    createdAt: row.created_at,
  };
}

export async function recordSystemEvent(input: RecordSystemEventInput) {
  if (!hasServiceRoleSupabaseEnv()) {
    console.warn("[system-event:mock]", input.source, input.message);
    return false;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    console.warn("[system-event:no-client]", input.source, input.message);
    return false;
  }

  const { error } = await supabase.from("system_events").insert({
    source: input.source,
    severity: input.severity,
    message: input.message,
    details: input.details ?? {},
  });

  if (error) {
    console.error("Failed to record system event", error.message);
    return false;
  }

  return true;
}

export async function getRecentSystemEvents(limit = 12) {
  if (!hasServiceRoleSupabaseEnv()) {
    return [] as SystemEvent[];
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [] as SystemEvent[];
  }

  const { data, error } = await supabase
    .from("system_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Failed to fetch system events", error?.message);
    return [] as SystemEvent[];
  }

  return (data as SystemEventRow[]).map(mapSystemEvent);
}
