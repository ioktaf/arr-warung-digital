import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, isValidAdminSessionToken } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleSupabaseEnv } from "@/lib/supabase/env";
import { APP_SCHEMA_VERSION } from "@/lib/app-config";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!isValidAdminSessionToken(sessionToken)) {
    return Response.json(
      {
        ok: false,
        message: "Admin session tidak valid.",
      },
      { status: 401 },
    );
  }

  if (!hasServiceRoleSupabaseEnv()) {
    return Response.json(
      {
        ok: false,
        message: "SUPABASE_SERVICE_ROLE_KEY belum aktif.",
      },
      { status: 503 },
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return Response.json(
      {
        ok: false,
        message: "Supabase admin client tidak tersedia.",
      },
      { status: 503 },
    );
  }

  const [products, promos, orders, orderItems, settings, runtimeMeta] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("*").order("created_at", { ascending: false }),
    supabase.from("store_settings").select("*").order("updated_at", { ascending: false }),
    supabase.from("app_runtime_meta").select("*").order("key", { ascending: true }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    expectedSchemaVersion: APP_SCHEMA_VERSION,
    products: products.data ?? [],
    promoCodes: promos.data ?? [],
    orders: orders.data ?? [],
    orderItems: orderItems.data ?? [],
    storeSettings: settings.data ?? [],
    runtimeMeta: runtimeMeta.data ?? [],
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="arr-warung-digital-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
