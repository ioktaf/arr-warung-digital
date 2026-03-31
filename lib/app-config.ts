export const APP_SCHEMA_VERSION = "20260331_ops_batch_v1";

export const ADMIN_ACTIVITY_ACTOR_LABEL = "shared-password-admin";

export const REQUIRED_STORAGE_BUCKETS = [
  "payment-proofs",
  "brand-assets",
  "product-images",
] as const;

export const REQUIRED_RUNTIME_TABLES = [
  "store_settings",
  "promo_codes",
  "order_items",
  "app_runtime_meta",
  "admin_activity_logs",
  "system_events",
] as const;
