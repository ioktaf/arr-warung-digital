create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'order_status'
  ) then
    create type public.order_status as enum (
      'pending',
      'awaiting_verification',
      'paid',
      'completed',
      'cancelled'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  price numeric(12, 2) not null check (price >= 0),
  description text,
  category text,
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  buyer_name text not null,
  buyer_wa text not null,
  unique_code integer not null default 0 check (unique_code >= 0 and unique_code <= 999),
  total_price numeric(12, 2) not null check (total_price >= 0),
  status public.order_status not null default 'pending',
  proof_img_url text,
  payment_note text,
  admin_note text,
  payment_confirmed_at timestamptz,
  paid_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  brand_name text not null default 'ARR Warung Digital',
  brand_compact_name text not null default 'Warung Digital',
  brand_logo_url text,
  brand_tagline text not null default 'Guest checkout, QRIS, manual mutation check',
  header_status_badge text not null default 'Semi-Auto',
  header_nav_labels jsonb not null default '[]'::jsonb,
  footer_description text not null default 'Fondasi MVP untuk jualan akun digital dengan verifikasi pembayaran manual yang tetap rapi.',
  footer_link_labels jsonb not null default '[]'::jsonb,
  demo_banner_text text not null default 'Mode demo aktif. Isi `.env.local` dan jalankan `supabase/schema.sql` di Supabase SQL Editor untuk workflow live.',
  hero_badge text not null default 'Storefront MVP',
  hero_title text not null,
  hero_description text not null,
  hero_primary_cta_label text not null default 'Lihat Produk',
  hero_secondary_cta_label text not null default 'Buka Dashboard Admin',
  workflow_badge text not null default 'Alur Semi-Auto',
  workflow_title text not null,
  workflow_description text not null,
  workflow_steps jsonb not null default '[]'::jsonb,
  catalog_badge text not null default 'Katalog',
  catalog_title text not null,
  catalog_description text not null,
  stack_badge text not null default 'Stack Ready',
  stack_highlights jsonb not null default '[]'::jsonb,
  dashboard_badge text not null default 'Catatan Dashboard',
  dashboard_notes jsonb not null default '[]'::jsonb,
  catalog_status_label text not null default 'Status Catalog',
  catalog_status_description text not null default 'Data produk otomatis fallback ke mock jika env Supabase belum diisi.',
  workflow_status_label text not null default 'Workflow Admin',
  workflow_status_description text not null default 'Service role dipakai di server untuk bikin order, upload bukti bayar, dan baca dashboard admin.',
  operations_status_label text not null default 'Operasional',
  operations_status_title text not null default 'Manual but guided',
  operations_status_description text not null default 'Fokus admin tetap jelas: cek order yang butuh verifikasi dulu, baru lanjut kirim akun.',
  checkout_eyebrow text not null default 'Checkout Produk',
  checkout_intro_description text not null default 'Buyer cukup isi nama dan WhatsApp dulu. Setelah itu sistem arahkan ke QRIS dan tombol konfirmasi pembayaran.',
  buyer_form_title text not null default '1. Isi Data Buyer',
  buyer_form_description text not null default 'Data ini dipakai admin untuk cocokin pembayaran dan kirim akun lewat WhatsApp.',
  buyer_ready_title text not null default 'Data Buyer Tersimpan',
  buyer_ready_description text not null default 'Order siap lanjut ke tahap pembayaran QRIS.',
  payment_display_label text not null,
  payment_qris_payload text not null,
  payment_merchant_name text not null,
  payment_merchant_city text not null,
  payment_checkout_title text not null,
  payment_checkout_description text not null,
  payment_instruction_lines jsonb not null default '[]'::jsonb,
  payment_confirm_title text not null default '3. Konfirmasi Sudah Bayar',
  payment_confirm_description text not null default 'Begitu form ini dikirim, order masuk ke status Awaiting Verification di dashboard admin.',
  payment_success_message text not null default 'Konfirmasi pembayaran sudah dikirim. Admin tinggal cek mutasi lalu update status order di dashboard.',
  payment_note_label text not null default 'Catatan Pembayaran',
  proof_upload_label text not null default 'Upload Bukti Bayar',
  payment_confirm_button_label text not null default 'Konfirmasi Sudah Bayar',
  checkout_continue_button_label text not null default 'Lanjut ke Pembayaran',
  tracker_title text not null default 'Tracker Order',
  operational_notes_title text not null default 'Catatan Operasional',
  operational_notes_description text not null default 'Halaman ini memang dibuat untuk workflow semi-auto.',
  operational_notes_lines jsonb not null default '[]'::jsonb,
  order_snapshot_title text not null default 'Snapshot Order',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.orders
add column if not exists unique_code integer not null default 0;

alter table public.store_settings
add column if not exists brand_logo_url text;

alter table public.store_settings
add column if not exists brand_name text not null default 'ARR Warung Digital';

alter table public.store_settings
add column if not exists brand_compact_name text not null default 'Warung Digital';

alter table public.store_settings
add column if not exists brand_tagline text not null default 'Guest checkout, QRIS, manual mutation check';

alter table public.store_settings
add column if not exists header_status_badge text not null default 'Semi-Auto';

alter table public.store_settings
add column if not exists header_nav_labels jsonb not null default '[]'::jsonb;

alter table public.store_settings
add column if not exists footer_description text not null default 'Fondasi MVP untuk jualan akun digital dengan verifikasi pembayaran manual yang tetap rapi.';

alter table public.store_settings
add column if not exists footer_link_labels jsonb not null default '[]'::jsonb;

alter table public.store_settings
add column if not exists demo_banner_text text not null default 'Mode demo aktif. Isi `.env.local` dan jalankan `supabase/schema.sql` di Supabase SQL Editor untuk workflow live.';

alter table public.store_settings
add column if not exists catalog_status_label text not null default 'Status Catalog';

alter table public.store_settings
add column if not exists catalog_status_description text not null default 'Data produk otomatis fallback ke mock jika env Supabase belum diisi.';

alter table public.store_settings
add column if not exists workflow_status_label text not null default 'Workflow Admin';

alter table public.store_settings
add column if not exists workflow_status_description text not null default 'Service role dipakai di server untuk bikin order, upload bukti bayar, dan baca dashboard admin.';

alter table public.store_settings
add column if not exists operations_status_label text not null default 'Operasional';

alter table public.store_settings
add column if not exists operations_status_title text not null default 'Manual but guided';

alter table public.store_settings
add column if not exists operations_status_description text not null default 'Fokus admin tetap jelas: cek order yang butuh verifikasi dulu, baru lanjut kirim akun.';

alter table public.store_settings
add column if not exists checkout_eyebrow text not null default 'Checkout Produk';

alter table public.store_settings
add column if not exists checkout_intro_description text not null default 'Buyer cukup isi nama dan WhatsApp dulu. Setelah itu sistem arahkan ke QRIS dan tombol konfirmasi pembayaran.';

alter table public.store_settings
add column if not exists buyer_form_title text not null default '1. Isi Data Buyer';

alter table public.store_settings
add column if not exists buyer_form_description text not null default 'Data ini dipakai admin untuk cocokin pembayaran dan kirim akun lewat WhatsApp.';

alter table public.store_settings
add column if not exists buyer_ready_title text not null default 'Data Buyer Tersimpan';

alter table public.store_settings
add column if not exists buyer_ready_description text not null default 'Order siap lanjut ke tahap pembayaran QRIS.';

alter table public.store_settings
add column if not exists payment_confirm_title text not null default '3. Konfirmasi Sudah Bayar';

alter table public.store_settings
add column if not exists payment_confirm_description text not null default 'Begitu form ini dikirim, order masuk ke status Awaiting Verification di dashboard admin.';

alter table public.store_settings
add column if not exists payment_success_message text not null default 'Konfirmasi pembayaran sudah dikirim. Admin tinggal cek mutasi lalu update status order di dashboard.';

alter table public.store_settings
add column if not exists payment_note_label text not null default 'Catatan Pembayaran';

alter table public.store_settings
add column if not exists proof_upload_label text not null default 'Upload Bukti Bayar';

alter table public.store_settings
add column if not exists payment_confirm_button_label text not null default 'Konfirmasi Sudah Bayar';

alter table public.store_settings
add column if not exists checkout_continue_button_label text not null default 'Lanjut ke Pembayaran';

alter table public.store_settings
add column if not exists tracker_title text not null default 'Tracker Order';

alter table public.store_settings
add column if not exists operational_notes_title text not null default 'Catatan Operasional';

alter table public.store_settings
add column if not exists operational_notes_description text not null default 'Halaman ini memang dibuat untuk workflow semi-auto.';

alter table public.store_settings
add column if not exists operational_notes_lines jsonb not null default '[]'::jsonb;

alter table public.store_settings
add column if not exists order_snapshot_title text not null default 'Snapshot Order';

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_orders_product_id on public.orders(product_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_buyer_wa on public.orders(buyer_wa);
create index if not exists idx_store_settings_key on public.store_settings(key);

drop trigger if exists trg_products_set_updated_at on public.products;
create trigger trg_products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists trg_store_settings_set_updated_at on public.store_settings;
create trigger trg_store_settings_set_updated_at
before update on public.store_settings
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Authenticated can manage products" on public.products;
create policy "Authenticated can manage products"
on public.products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders
for insert
to anon, authenticated
with check (
  status = 'pending'
  and proof_img_url is null
);

drop policy if exists "Authenticated can read orders" on public.orders;
create policy "Authenticated can read orders"
on public.orders
for select
to authenticated
using (true);

drop policy if exists "Authenticated can update orders" on public.orders;
create policy "Authenticated can update orders"
on public.orders
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings"
on public.store_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can manage store settings" on public.store_settings;
create policy "Authenticated can manage store settings"
on public.store_settings
for all
to authenticated
using (true)
with check (true);

insert into public.store_settings (
  key,
  brand_name,
  brand_compact_name,
  brand_logo_url,
  brand_tagline,
  header_status_badge,
  header_nav_labels,
  footer_description,
  footer_link_labels,
  demo_banner_text,
  hero_badge,
  hero_title,
  hero_description,
  hero_primary_cta_label,
  hero_secondary_cta_label,
  workflow_badge,
  workflow_title,
  workflow_description,
  workflow_steps,
  catalog_badge,
  catalog_title,
  catalog_description,
  stack_badge,
  stack_highlights,
  dashboard_badge,
  dashboard_notes,
  catalog_status_label,
  catalog_status_description,
  workflow_status_label,
  workflow_status_description,
  operations_status_label,
  operations_status_title,
  operations_status_description,
  checkout_eyebrow,
  checkout_intro_description,
  buyer_form_title,
  buyer_form_description,
  buyer_ready_title,
  buyer_ready_description,
  payment_display_label,
  payment_qris_payload,
  payment_merchant_name,
  payment_merchant_city,
  payment_checkout_title,
  payment_checkout_description,
  payment_instruction_lines,
  payment_confirm_title,
  payment_confirm_description,
  payment_success_message,
  payment_note_label,
  proof_upload_label,
  payment_confirm_button_label,
  checkout_continue_button_label,
  tracker_title,
  operational_notes_title,
  operational_notes_description,
  operational_notes_lines,
  order_snapshot_title
)
values (
  'default',
  'ARR Warung Digital',
  'Warung Digital',
  null,
  'Guest checkout, QRIS, manual mutation check',
  'Semi-Auto',
  '["Produk", "Alur Semi-Auto", "Dashboard Admin"]'::jsonb,
  'Fondasi MVP untuk jualan akun digital dengan verifikasi pembayaran manual yang tetap rapi.',
  '["Storefront", "Admin", "Checkout Demo"]'::jsonb,
  'Mode demo aktif. Isi `.env.local` dan jalankan `supabase/schema.sql` di Supabase SQL Editor untuk workflow live.',
  'Storefront MVP',
  'Jualan produk digital dengan checkout cepat, QRIS, dan verifikasi mutasi manual yang tetap terasa modern.',
  'Buyer bisa checkout tanpa login, admin dapat notifikasi order yang perlu dicek, dan semua fondasinya sudah disiapkan buat nyambung ke Supabase.',
  'Lihat Produk',
  'Buka Dashboard Admin',
  'Alur Semi-Auto',
  'Buyer simpel, admin tetap pegang kendali.',
  'Flow ini sengaja dibuat hemat biaya: belum perlu langganan API mutasi, tapi UX buyer tetap rapi dan admin tidak perlu nebak-nebak transfer masuk itu milik siapa.',
  '[
    {"title":"Buyer pilih produk","description":"Guest checkout cukup isi nama dan WhatsApp, lalu sistem arahkan ke halaman pembayaran QRIS."},
    {"title":"Buyer klik konfirmasi bayar","description":"Bukti transfer opsional, tapi tombol konfirmasi bikin admin tahu ada transaksi yang perlu dicocokkan."},
    {"title":"Admin verifikasi mutasi","description":"Dashboard menyorot order Awaiting Verification supaya admin tinggal cek mutasi bank atau e-wallet."},
    {"title":"Admin kirim akun","description":"Setelah status Paid, admin bisa kirim akun via WhatsApp dan tutup order ke Completed."}
  ]'::jsonb,
  'Katalog',
  'Struktur produk sudah siap buat dihubungkan ke Supabase.',
  'Saat env belum ada, halaman ini tetap hidup pakai mock data. Begitu tabel `products` terisi, storefront otomatis baca data live.',
  'Stack Ready',
  '[
    "Next.js App Router untuk storefront dan dashboard admin",
    "Supabase PostgreSQL + Storage untuk order dan bukti bayar",
    "Realtime-ready untuk notif order masuk",
    "Deploy ringan di Vercel dengan env Supabase"
  ]'::jsonb,
  'Catatan Dashboard',
  '[
    "Order baru masuk ke Pending saat buyer submit data checkout.",
    "Saat buyer klik konfirmasi bayar, order naik ke Awaiting Verification.",
    "Admin cek mutasi manual, lalu update status ke Paid dan Completed."
  ]'::jsonb,
  'Status Catalog',
  'Data produk otomatis fallback ke mock jika env Supabase belum diisi.',
  'Workflow Admin',
  'Service role dipakai di server untuk bikin order, upload bukti bayar, dan baca dashboard admin.',
  'Operasional',
  'Manual but guided',
  'Fokus admin tetap jelas: cek order yang butuh verifikasi dulu, baru lanjut kirim akun.',
  'Checkout Produk',
  'Buyer cukup isi nama dan WhatsApp dulu. Setelah itu sistem arahkan ke QRIS dan tombol konfirmasi pembayaran.',
  '1. Isi Data Buyer',
  'Data ini dipakai admin untuk cocokin pembayaran dan kirim akun lewat WhatsApp.',
  'Data Buyer Tersimpan',
  'Order siap lanjut ke tahap pembayaran QRIS.',
  'QRIS Statis ARR WARUNG DIGITAL',
  '00020101021126760024ID.CO.SPEEDCASH.MERCHANT01189360081530002045920215ID10250020459260303UKE51440014ID.CO.QRIS.WWW0215ID10254280460520303UKE5204526253033605802ID5918ARR WARUNG DIGITAL6006KENDAL61055138162330509S3443864101091263033620703A016304E9B0',
  'ARR WARUNG DIGITAL',
  'KENDAL',
  '2. Transfer via QRIS',
  'Pakai QRIS statis merchant dulu. Total transfer mengikuti order dan sudah termasuk kode unik untuk bantu admin cek mutasi.',
  '[
    "Scan QRIS merchant ARR WARUNG DIGITAL.",
    "Perhatikan total transfer di halaman checkout karena nominal ini sudah termasuk kode unik.",
    "Transfer sesuai total akhir, bukan harga dasar produk.",
    "Kembali ke halaman ini lalu klik konfirmasi bayar.",
    "Upload bukti transfer kalau ada biar admin lebih cepat cek."
  ]'::jsonb,
  '3. Konfirmasi Sudah Bayar',
  'Begitu form ini dikirim, order masuk ke status Awaiting Verification di dashboard admin.',
  'Konfirmasi pembayaran sudah dikirim. Admin tinggal cek mutasi lalu update status order di dashboard.',
  'Catatan Pembayaran',
  'Upload Bukti Bayar',
  'Konfirmasi Sudah Bayar',
  'Lanjut ke Pembayaran',
  'Tracker Order',
  'Catatan Operasional',
  'Halaman ini memang dibuat untuk workflow semi-auto.',
  '[
    "Admin tidak perlu mantengin mutasi tanpa konteks karena order masuk ke dashboard lebih dulu.",
    "Proof upload bersifat opsional, tapi sangat membantu saat nominal order mirip-mirip.",
    "Kalau nanti mau full-auto, struktur tabel order dan payment proof ini masih enak untuk ditingkatkan."
  ]'::jsonb,
  'Snapshot Order'
)
on conflict (key) do nothing;

update public.store_settings
set payment_checkout_description = 'Pakai QRIS statis merchant dulu. Total transfer mengikuti order dan sudah termasuk kode unik untuk bantu admin cek mutasi.'
where key = 'default'
  and payment_checkout_description = 'Pakai QRIS statis merchant dulu. Setelah transfer, buyer klik konfirmasi pembayaran di bawah.';

update public.store_settings
set payment_instruction_lines = '[
  "Scan QRIS merchant ARR WARUNG DIGITAL.",
  "Perhatikan total transfer di halaman checkout karena nominal ini sudah termasuk kode unik.",
  "Transfer sesuai total akhir, bukan harga dasar produk.",
  "Kembali ke halaman ini lalu klik konfirmasi bayar.",
  "Upload bukti transfer kalau ada biar admin lebih cepat cek."
]'::jsonb
where key = 'default'
  and payment_instruction_lines = '[
    "Scan QRIS merchant ARR WARUNG DIGITAL.",
    "Pastikan nominal yang dibayar sama dengan harga produk.",
    "Kembali ke halaman ini lalu klik konfirmasi bayar.",
    "Upload bukti transfer kalau ada biar admin lebih cepat cek."
  ]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload payment proofs" on storage.objects;
create policy "Public can upload payment proofs"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'payment-proofs');

drop policy if exists "Authenticated can read payment proofs" on storage.objects;
create policy "Authenticated can read payment proofs"
on storage.objects
for select
to authenticated
using (bucket_id = 'payment-proofs');

drop policy if exists "Authenticated can update payment proofs" on storage.objects;
create policy "Authenticated can update payment proofs"
on storage.objects
for update
to authenticated
using (bucket_id = 'payment-proofs')
with check (bucket_id = 'payment-proofs');

drop policy if exists "Authenticated can delete payment proofs" on storage.objects;
create policy "Authenticated can delete payment proofs"
on storage.objects
for delete
to authenticated
using (bucket_id = 'payment-proofs');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end
$$;
