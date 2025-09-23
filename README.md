# Web-Anime (Animelist)

Deskripsi singkat:

Ini Web-AnimeList yang menampilkan daftar anime lengkap dengan fitur pencarian, filter berdasarkan musim/genre/tahun, sorting, pagination, rekomendasi (trending), dan halaman detail anime. Aplikasi ini terhubung ke server Express/Node yang menyediakan API untuk mengambil data anime dan mencatat klik (click count).

Repository ini berisi dua bagian utama:

- `client/` — Frontend (React, Vite)
- `server/` — Backend (Node, Express, PostgreSQL via `pg`)

## Fitur Utama

- Daftar anime lengkap dengan thumbnail, judul, tanggal rilis, catatan singkat, jumlah episode, season, genre, rating admin, dan skor MyAnimeList.
- Pencarian judul anime (search box di navbar).
- Filter berdasarkan Season (contoh: "Winter 2024"), Genre, dan Tahun Rilis.
- Sorting (Admin Rating, MyAnimeList Score, Tahun Rilis, Judul A-Z).
- Pagination untuk navigasi daftar (10 item per halaman di komponen utama).
- Rekomendasi / Trending di sidebar dan navbar (berbasis click_count dari backend).
- Klik thumbnail atau judul membuka URL anime di tab baru dan mengirimkan POST untuk menambah click_count.
- Halaman specialized: `/anime-list`, `/genre`, `/tahun-rilis`, `/about`, serta route detail `/anime/:id`.

## Struktur Proyek (singkat)

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

### Menyiapkan database (cepat) — buat user & database agar server bisa connect

File contoh `.env` untuk server sudah disertakan sebagai `server/.env.example`. Salin file ini menjadi `server/.env` dan isi password yang aman.

Jika Anda menggunakan PostgreSQL lokal, berikut langkah singkat untuk membuat user & database (jalankan di PowerShell atau PS terminal dengan akses ke `psql`):

1. Masuk ke psql sebagai user postgres:

```powershell
psql -U postgres
```

2. Di prompt psql, jalankan perintah (ubah nama user/db/password sesuai `server/.env.example` jika perlu):

```sql
-- ganti 'gatan200401' dengan password yang aman
CREATE USER anime_user1 WITH PASSWORD 'gatan200401';
CREATE DATABASE anime_db1 OWNER anime_user1;
GRANT ALL PRIVILEGES ON DATABASE anime_db1 TO anime_user1;
\q
```

3. Import schema dan seed ke database (menggunakan `psql`):

```powershell
psql -U anime_user1 -d anime_db1 -h localhost -f .\database\schema.sql
psql -U anime_user1 -d anime_db1 -h localhost -f .\database\seed.sql
```

Jika Anda lebih suka menggunakan Docker, jalankan Postgres lewat Docker Compose (jika Anda menyediakan `docker-compose.yml`) atau jalankan perintah `docker run` lalu import file SQL seperti langkah-langkah sebelumnya.

Setelah database siap dan `server/.env` terisi, jalankan server:

```powershell
cd server
npm install
npm start
```


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

Catatan: jika gambar tidak muncul setelah push ke GitHub, pastikan file benar-benar ter-commit dan path relatif sama seperti di atas (`/client/public/screenshots/<nama-file>`). GitHub menampilkan asset static yang ada di repo.


## Men-deploy ke GitHub Pages / Vercel / Netlify

- GitHub Pages: build frontend (`npm run build` di `client`) dan deploy `client/dist` (butuh setup gh-pages atau manual). Karena ada backend, Anda bisa deploy hanya frontend ke GitHub Pages, dan backend ke Heroku / Railway / Render / Fly.
- Vercel / Netlify: mudah untuk frontend. Untuk full stack, pertimbangkan deploy backend ke Railway/Render and set environment variable pada Vercel untuk API base URL.

## Cara push ke GitHub (singkat)

1. Buat repo di GitHub.
2. Tambah remote dan push:

   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/REPO.git
   git branch -M main
   git push -u origin main

3. Setelah push, buka repo di GitHub, README akan ditampilkan otomatis.

## Catatan Keamanan & Legal

- Aplikasi ini memuat link ke situs pihak ketiga. Pastikan tidak melanggar hak cipta jika menampilkan konten berlisensi.

## Contributing

- Jika ingin menambah fitur, buka issue atau buat pull request. Beberapa ide: menambahkan pagination di API, caching, otentikasi admin, menambahkan unit test.

## Kontak

- Jika Anda perlu saya bantu menambahkan screenshot ke README atau menyiapkan GitHub repo, beri tahu folder gambar yang ingin ditampilkan dan saya akan menambahkan markupnya.

---

README ini dibuat otomatis berdasarkan isi proyek saat ini. Jika ada detail yang kurang akurat (mis. port berbeda, atau path gambar), beri tahu dan saya akan perbarui README.
