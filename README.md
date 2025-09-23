# 🌸 Web-AnimeList

Aplikasi **Web-AnimeList** adalah platform daftar anime dengan fitur pencarian, filter, sorting, pagination, serta rekomendasi anime trending.  
Dibangun dengan **React (Vite) untuk frontend** dan **Node.js + Express + PostgreSQL** untuk backend.

---

## ✨ Fitur Utama

- 🎴 **Daftar Anime Lengkap**  
  Menampilkan thumbnail, judul, tanggal rilis, catatan singkat, jumlah episode, season, genre, rating admin, dan skor MyAnimeList.

- 🔎 **Pencarian Anime**  
  Cari anime langsung melalui search box di navbar.

- 🗂 **Filter & Sorting**  
  - Filter: Season (misalnya *Winter 2024*), Genre, Tahun Rilis  
  - Sorting: Rating Admin, Skor MAL, Tahun Rilis, Judul A–Z  

- 📑 **Pagination**  
  Navigasi daftar anime dengan 10 item per halaman.

- 🚀 **Trending / Rekomendasi**  
  Anime populer ditampilkan di sidebar & navbar, berdasarkan jumlah klik (click count).

- 📖 **Halaman Detail & Routing Khusus**  
  - `/anime-list`  
  - `/genre`  
  - `/tahun-rilis`  
  - `/about`  
  - `/anime/:id` (detail anime)

- 📊 **Analitik Click Count**  
  Klik pada thumbnail/judul akan membuka link anime di tab baru dan menambah `click_count`.

---

## 📂 Struktur Proyek

- client/
  - `src/` — Kode React
  - `public/gambar/` — assets gambar contoh
  - `package.json` — scripts: `dev`, `build`, `preview`, `lint`
- server/
  - `server.js` — Express API endpoints
  - `db.js` — koneksi database (Postgres)
  - `package.json` — script: `start`

## Persyaratan

- Node.js (v16+ direkomendasikan)
- PostgreSQL (jika ingin menjalankan backend dengan DB lokal)

## Menjalankan secara lokal

1. Clone repository ke mesin Anda.
https://github.com/alazriel6/Web-Anime.git

2. Jalankan backend (server):

   - Masuk ke folder `server` dan siapkan file `.env` berisi minimal `PORT` dan koneksi Postgres (lihat `server/db.js` jika perlu):

     PORT=5000
     DATABASE_URL=postgresql://user:password@localhost:5432/dbname

   - Install dependencies dan jalankan server:

     cd server
     npm install
     npm start

   Server akan berjalan sesuai `PORT` di `.env` (contoh: `5000`).

3. Jalankan frontend (client):

     cd client
     npm install
     npm run dev

   Frontend default dijalankan oleh Vite (biasanya http://localhost:5173). Pastikan backend berjalan di `http://localhost:5000` atau sesuaikan URL di kode client.

Catatan: project mengakses API pada `http://localhost:5000/api/anime` dan `http://localhost:5000/api/trending`. Jika backend berjalan di host/port lain, cari dan update URL fetch pada komponen (mis. `src/components/*/*.jsx`).

## Endpoint API (dari `server.js`)

- GET /api/anime — Mengembalikan semua anime dengan field: id, title, image, release_date, note, rating, url, total_episodes, mal_score, click_count, genres (array), seasons (array)
- GET /api/trending — Mengembalikan anime terpopuler (ORDER BY click_count DESC LIMIT 12)
- POST /api/anime/:id/click — Menambah `click_count` untuk anime (dipanggil ketika user klik thumbnail/judul)

## Screenshots

Berikut beberapa screenshot tampilan aplikasi (disimpan di `client/public/screenshots/`):

![Home / Landing](/client/public/screenshots/Web-anime-list2.png)

![Detail Anime / Sidebar](/client/public/screenshots/Web-anime-list3.png)

![Filter by Genre / Season](/client/public/screenshots/Web-anime-list5.png)

![Trending And Tahun Rilis ](/client/public/screenshots/Web-anime-list1.png)
