# Nexus Tech — Company Profile, Portfolio & Admin Dashboard

Situs **frontend-only** (HTML + CSS + JavaScript terpisah, tanpa Python/Node/PHP/JSON server).
Semua data disimpan di **localStorage browser** sehingga Admin dan situs publik terintegrasi **pada browser yang sama**.

## Menjalankan
Buka lewat server statis apa pun (WebCrypto untuk login butuh `localhost` atau HTTPS), mis. ekstensi Live Server, Nginx, Apache, atau hosting statis.
Buka `index.html`. Admin: `login.html` → akun admin pertama dibuat saat pertama kali (tidak ada password bawaan).

## Struktur
- Publik: **satu file `index.html`** (semua halaman — Home, About, Services, Portfolio, Project Detail, Partners, Journey, Contact, FAQ — dirender lewat router hash, mis. `index.html#/portfolio?cat=iot`, `#/project-detail?id=p-iot-1`).
- Admin: `login.html`, `admin.html`
- `assets/css/` (style, admin) · `assets/js/` (icons, store, app, ai, pages, login, admin) · `assets/icons/` (logo + 58 ikon SVG) · `assets/images/` (ilustrasi SVG)
- `tools/build-icons.js` — opsional, membuat ulang file ikon `.svg` dari `assets/js/icons.js`.
- `robots.txt`, `sitemap.xml` (path relatif; sesuaikan dengan domain Anda). Karena situs satu halaman berbasis hash, mesin pencari hanya melihat `index.html`; untuk SEO per-halaman butuh render server/pra-render.

## Fitur yang benar-benar berfungsi
Tema terang/gelap, 9 bahasa untuk menu/UI/Nexus AI (konten proyek tetap Indonesia), pencarian global (Ctrl/Cmd+K), notifikasi, portofolio (16 card DEMO, 4 per kategori, filter/cari/urut, halaman detail, diagram SVG, bagikan tautan), mitra (kategori, filter negara, modal detail, form proposal tervalidasi), Company Journey (timeline, filter), FAQ accordion, form kontak, Nexus AI (aturan, TTS, input suara bila browser mendukung), komentar + balasan + laporan spam + moderasi, Admin CRUD (proyek, mitra, milestone, layanan, FAQ, pengguna), draft/publikasi/arsip, preview, upload gambar (maks 300 KB), inbox pesan/proposal, audit log, ekspor CSV, backup/restore JSON.

## Pembaruan terbaru
- 4 mitra DEMO per kategori (24), detail proyek unik, milestone tertaut ke proyek/mitra.
- Admin: Jalur Wiring Cable, Perangkat IoT, Robot & Embedded (CRUD, tertaut ke proyek, tampil di detail proyek).
- Admin > Kelengkapan & Auto-isi: laporan kelengkapan + tombol isi otomatis field kosong (berawalan `[Auto-isi DEMO]`). Tidak pernah mengisi data fakta (tahun, email, telepon, alamat, website, negara, logo).
- Diagram arsitektur SVG otomatis per proyek.
- Migrasi otomatis data v1→v2: entri buatan Anda tidak diubah.

## Batasan jujur (butuh backend)
| Kebutuhan | Status |
|---|---|
| Login & RBAC aman | **Demo sisi klien** (PBKDF2 + lockout di browser). Bisa dilewati lewat DevTools. Produksi: autentikasi server, sesi cookie HttpOnly, CSRF, cek izin di server. |
| Data bersama antar pengunjung | **Tidak ada.** Pesan, proposal, komentar tersimpan di browser pengirim, bukan di perangkat admin lain. Butuh database + API. |
| Komentar real-time | **Tidak real-time.** Butuh WebSocket/layanan real-time + moderasi server + rate limit server. |
| Nexus AI model sungguhan | **Berbasis aturan.** Untuk LLM: buat endpoint server (API key hanya di server) lalu set `window.NT_AI_ENDPOINT`. |
| Email/proposal terkirim | Tidak terkirim otomatis. Isi email resmi di Admin > Profil agar tautan `mailto:` tersedia. |
| Terjemahan | UI inti & Nexus AI (id/en lengkap; bahasa lain sebagian). Konten proyek tidak diterjemahkan. |
| Statistik | Hanya tayangan di browser ini. |

## Data DEMO
Semua proyek, mitra, milestone, dan profil awal bertanda **DEMO**/placeholder. Tidak ada tahun berdiri, email, telepon, logo mitra, atau tautan yang dikarang. Ganti lewat Admin dan matikan label DEMO.
