insert into public.products (
  title,
  slug,
  price,
  description,
  category,
  stock,
  is_active
)
values
  ('ChatGPT Business 1 Bulan (Team Invite)', 'chatgpt-business-1-bulan-team-invite', 59000, 'Seat business via team invite dengan aktivasi manual lewat WhatsApp admin.', 'AI Premium', 12, true),
  ('Google AI Pro 1 Bulan', 'google-ai-pro-1-bulan', 49000, 'Paket Google AI Pro bulanan untuk kebutuhan riset, drafting, dan eksperimen harian.', 'AI Premium', 14, true),
  ('Leonardo AI Enterprise', 'leonardo-ai-enterprise', 10000, 'Akses Leonardo AI enterprise dengan harga entry-level untuk buyer yang butuh image generation cepat.', 'AI Premium', 18, true),
  ('Netflix Premium (1 Profil)', 'netflix-premium-1-profil', 59000, 'Paket Netflix premium private profile untuk pengalaman nonton yang lebih aman dan stabil.', 'Streaming', 10, true),
  ('Scribd Premium', 'scribd-premium', 19000, 'Akses premium untuk ebook, audiobooks, dan dokumen referensi digital.', 'Reading Tools', 20, true),
  ('GetContact Premium', 'getcontact-premium', 12000, 'GetContact premium untuk kebutuhan identifikasi nomor dan proteksi spam harian.', 'Utilities', 24, true),
  ('CapCut Pro', 'capcut-pro', 26000, 'Akses CapCut Pro untuk editing video sosial media dengan template dan fitur premium.', 'Design Tools', 18, true),
  ('Google Drive Storage 1 TB Lifetime', 'google-drive-storage-1tb-lifetime', 180000, 'Storage Google Drive 1 TB lifetime untuk buyer yang butuh ruang simpan jangka panjang.', 'Cloud Storage', 6, true),
  ('ExpressVPN 1 Bulan', 'expressvpn-1-bulan', 15000, 'Akses VPN bulanan untuk browsing aman, streaming, dan kebutuhan privasi dasar.', 'Security', 25, true),
  ('Canva Pro 1 Bulan', 'canva-pro-1-bulan', 15000, 'Canva Pro bulanan untuk desain cepat, presentasi, dan kebutuhan konten harian.', 'Design Tools', 30, true),
  ('Canva Pro 1 Tahun', 'canva-pro-1-tahun', 95000, 'Paket hemat Canva Pro tahunan untuk buyer yang butuh akses lebih panjang.', 'Design Tools', 12, true),
  ('YouTube Premium 1 Bulan', 'youtube-premium-1-bulan', 29000, 'YouTube Premium bulanan tanpa iklan untuk streaming musik dan video lebih nyaman.', 'Streaming', 20, true),
  ('YouTube Premium 3 Bulan', 'youtube-premium-3-bulan', 59000, 'Paket YouTube Premium tiga bulan buat buyer yang mau lebih hemat dari bulanan.', 'Streaming', 14, true),
  ('Spotify Premium 1 Bulan', 'spotify-premium-1-bulan', 29000, 'Spotify Premium untuk streaming musik bebas iklan selama satu bulan.', 'Streaming', 18, true),
  ('Perplexity Pro Voucher 1 Tahun', 'perplexity-pro-voucher-1-tahun', 250000, 'Voucher Perplexity Pro tahunan untuk buyer yang butuh riset AI jangka panjang.', 'AI Premium', 8, true),
  ('Gmail Fresh (No Verif)', 'gmail-fresh-no-verif', 7000, 'Akun Gmail fresh tanpa verifikasi, cocok untuk kebutuhan setup cepat.', 'Accounts', 50, true),
  ('ChatGPT Plus 1 Bulan', 'chatgpt-plus-1-bulan', 20000, 'Akun sharing yang lebih hemat untuk akses ChatGPT Plus selama satu bulan.', 'AI Sharing', 20, true),
  ('Loklok Premium VIP 1 Bulan', 'loklok-premium-vip-1-bulan', 25000, 'Paket Loklok VIP bulanan untuk akses tontonan premium dengan harga hemat.', 'Streaming', 20, true),
  ('Leonardo AI 1 Bulan', 'leonardo-ai-1-bulan', 69000, 'Paket Leonardo AI satu bulan untuk buyer yang rutin bikin visual generatif.', 'AI Sharing', 10, true),
  ('Blackbox AI 1 Bulan', 'blackbox-ai-1-bulan', 49000, 'Akses Blackbox AI bulanan untuk coding assistant dan workflow developer.', 'AI Sharing', 14, true),
  ('Gamma AI 1 Bulan', 'gamma-ai-1-bulan', 39000, 'Gamma AI bulanan untuk bikin deck, dokumen, dan presentasi lebih cepat.', 'AI Sharing', 16, true),
  ('Crunchyroll 1 Bulan', 'crunchyroll-1-bulan', 19000, 'Crunchyroll bulanan untuk buyer yang fokus nonton anime dengan akses premium.', 'Streaming', 18, true),
  ('Perplexity Pro 3 Bulan', 'perplexity-pro-3-bulan', 59000, 'Paket sharing Perplexity Pro tiga bulan untuk riset AI yang lebih hemat.', 'AI Sharing', 12, true),
  ('Perplexity Pro 1 Bulan', 'perplexity-pro-1-bulan', 25000, 'Perplexity Pro satu bulan untuk buyer yang butuh riset AI cepat dan praktis.', 'AI Sharing', 18, true),
  ('Bstation 1 Bulan', 'bstation-1-bulan', 15000, 'Bstation premium bulanan untuk tontonan anime dan hiburan dengan harga ringan.', 'Streaming', 22, true)
on conflict (slug) do update
set
  title = excluded.title,
  price = excluded.price,
  description = excluded.description,
  category = excluded.category,
  stock = excluded.stock,
  is_active = excluded.is_active;
