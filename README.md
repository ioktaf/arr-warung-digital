# ARR Warung Digital

Storefront produk digital dengan guest checkout, QRIS, upload bukti bayar, dan dashboard admin semi-auto berbasis Next.js + Supabase.

## Yang Sudah Siap

- Storefront publik dengan katalog produk dan alur semi-auto.
- Halaman checkout per produk dengan QRIS asli dari payload merchant dan konfirmasi bayar.
- Dashboard admin untuk melihat order dan kelola produk langsung dari website.
- Panel admin settings untuk mengatur copy storefront, panel pembayaran, dan QRIS merchant.
- Refund calculator internal untuk hitung refund prorata.
- Password gate sederhana untuk mengunci area admin.
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

4. Jalankan isi file `supabase/schema.sql` di Supabase SQL Editor.
   File ini sekarang juga membuat table `store_settings` untuk panel konfigurasi storefront dan pembayaran.

5. Lanjut jalankan isi file `supabase/seed-products.sql` untuk mengisi katalog awal.

6. Start local dev server:

```bash
npm run dev
```

## Route Penting

- `/` storefront
- `/checkout/[slug]` checkout produk
- `/admin` dashboard order admin
- `/admin/login` login admin
- `/admin/products` dashboard produk admin
- `/admin/settings` control center storefront, payment, dan refund calculator

## Verifikasi

```bash
npm run typecheck
npm run lint
npm run build
```
