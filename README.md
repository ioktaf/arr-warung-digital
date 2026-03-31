# ARR Warung Digital

Storefront produk digital dengan guest checkout, keranjang multi-seat, QRIS nominal-dynamic, upload bukti bayar, promo dropdown opsional, dan dashboard admin semi-auto berbasis Next.js + Supabase.

## Yang Sudah Siap

- Storefront publik dengan katalog produk dan alur semi-auto.
- Halaman checkout per produk dan checkout keranjang dengan QRIS nominal-dynamic dari payload merchant, promo opsional, dan konfirmasi bayar.
- Dashboard admin untuk melihat order, filter/search order, dan kelola produk langsung dari website.
- Panel admin settings untuk mengatur logo website, copy storefront, panel pembayaran, dan base payload QRIS merchant.
- Upload logo website dan logo/gambar produk langsung dari panel admin.
- Refund calculator internal untuk hitung refund prorata.
- Password gate admin dengan rate-limit sederhana untuk percobaan login yang gagal.
- Halaman system admin untuk cek schema, monitoring, audit activity, dan export backup JSON.
- Notifikasi admin ke Telegram saat order baru, konfirmasi bayar, dan perubahan status order jika env Telegram diisi.
- Fallback mock data kalau env Supabase belum diisi.
- Schema SQL Supabase di `supabase/schema.sql`.
- Seed produk sesuai price list di `supabase/seed-products.sql`.

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Copy env:

```bash
cp .env.example .env.local
```

3. Isi nilai Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_ACCESS_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `TELEGRAM_BOT_TOKEN` (opsional)
- `TELEGRAM_CHAT_ID` (opsional)

4. Jalankan isi file `supabase/schema.sql` di Supabase SQL Editor.
   Schema ini sekarang juga membuat:
   - `store_settings` untuk panel konfigurasi storefront dan pembayaran
   - `promo_codes` untuk promo dropdown di checkout
   - `app_runtime_meta`, `admin_activity_logs`, dan `system_events` untuk monitoring/admin ops
   - bucket storage `payment-proofs`, `brand-assets`, dan `product-images`

5. Lanjut jalankan isi file `supabase/seed-products.sql` untuk mengisi katalog awal.

6. Start local dev server:

```bash
npm run dev
```

## Route Penting

- `/` storefront
- `/checkout/[slug]` checkout produk
- `/cart` keranjang buyer
- `/checkout/cart` checkout keranjang
- `/track` lacak order buyer
- `/admin` dashboard order admin
- `/admin/login` login admin
- `/admin/products` dashboard produk admin
- `/admin/promos` dashboard promo admin
- `/admin/settings` control center storefront, payment, dan refund calculator
- `/admin/system` monitoring, audit log, dan backup export

## Catatan Operasional

- Setelah update code yang menyentuh schema, jalankan ulang `supabase/schema.sql` di project Supabase yang sama dengan env Vercel kamu.
- Telegram notification bersifat no-op kalau `TELEGRAM_BOT_TOKEN` atau `TELEGRAM_CHAT_ID` belum diisi.
- Backup JSON admin tersedia di `/admin/system` dan mengambil snapshot dari tabel utama beserta runtime meta.

## Verifikasi

```bash
npm run typecheck
npm run lint
npm run build
```
