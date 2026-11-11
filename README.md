# kamusmandarindonesia

Repositori dataset acuan kosakata **Kamus Bahasa Mandar–Indonesia (Edisi Revisi, 2025)** untuk aplikasi dan server kamus Bahasa Mandar–Indonesia.

## Sumber Acuan Resmi (Single Source of Truth)

- **Berkas PDF acuan:** `dataset/kamus-mandar-indonesia-2025.pdf`
- **Judul:** *Kamus Bahasa Mandar–Indonesia (Edisi Revisi)*
- **Penyusun:** Sandra Safitri Hanan, dkk.
- **Penerbit:** Kementerian Pendidikan Dasar dan Menengah / Balai Bahasa Provinsi Sulawesi Selatan (2025)
- **Ukuran & Checksum:** `3.983.041` byte | SHA-256 `3D9A671F5A5CC91523A77C308D304D36C178C5A8B2E198B1532ECFF1EC4F794C`
- **Cakupan PDF:** `548` halaman PDF (`halaman PDF 48–546` merupakan isi kamus tercetak halaman `1–499`), memuat `4.908` entri (`2.660` lema utama dan `2.248` sublema) pada `20` seksi abjad (`A`–`W`).

PDF di dalam folder `dataset/` adalah sumber acuan utama kosakata. Berkas indeks JSON terstruktur (`dataset/manifest.json` dan `dataset/vocabulary.json`) diturunkan langsung secara deterministik dari PDF tersebut dan diverifikasi terhadap checksum SHA-256 PDF.

## Struktur Repositori

- `dataset/kamus-mandar-indonesia-2025.pdf` — Dokumen PDF kamus resmi sebagai sumber kebenaran (*source of truth*).
- `dataset/manifest.json` — Metadata terstruktur kamus, daftar singkatan, indeks seksi `A`–`W`, dan checksum PDF.
- `dataset/vocabulary.json` — Indeks kosakata terstruktur hasil ekstraksi PDF beserta rujukan halaman buku dan halaman PDF per entri.
- `src/pdf-parser.js` — Ekstraktor PDF murni Node.js (tanpa dependensi eksternal) untuk membaca halaman kamus dua kolom, penanda homonim, tag kelas kata, lema utama, dan sublema.
- `src/dataset-server.js` — Modul acuan dataset sisi server (`KamusMandarDataset`) untuk memuat, memverifikasi SHA-256 PDF, serta menyediakan API pencarian dan lookup kosakata.
- `src/server.js` — HTTP API server Node.js tanpa dependensi eksternal (`npm start`), melayani pencarian, lookup, halaman buku, dan berkas PDF resmi.
- `public/index.html` & `scripts/build-pages.js` — Antarmuka web statis kamus Mandar–Indonesia untuk GitHub Pages (`github.io`) yang memuat langsung `./dataset/vocabulary.json`, `./dataset/manifest.json`, dan tautan halaman PDF `./dataset/kamus-mandar-indonesia-2025.pdf`.
- `.github/workflows/pages.yml` — Workflow GitHub Actions otomatis yang memverifikasi dataset, menjalankan seluruh test, dan memublikasikan hasil statis ke branch `gh-pages` pada setiap push ke `main`.
- `api/kamus.js` & `vercel.json` — Entrypoint Vercel Functions (Fluid Compute) dengan bundel folder `dataset/**` agar seluruh endpoint API dan PDF acuan siap berjalan di Vercel.
- `scripts/build-dataset.js` — Skrip pembangkit & verifikasi ulang indeks JSON dari PDF resmi.
- `test/dataset.test.js`, `test/server.test.js`, & `test/pages.test.js` — Pengujian otomatis (`node:test`) untuk keutuhan PDF, seksi abjad, pencarian dua arah, endpoint HTTP API, serta build statis GitHub Pages.

## Menjalankan HTTP API Server

```powershell
# Menjalankan server (default PORT=3000, HOST=0.0.0.0)
npm start
```

Endpoint yang tersedia:
- `GET /` — Ringkasan layanan, sumber PDF, dan daftar endpoint.
- `GET /health` — Pemeriksaan kesehatan server & verifikasi integritas SHA-256 PDF.
- `GET /api/manifest` — Metadata kamus, daftar singkatan, dan seksi `A`–`W`.
- `GET /api/stats` — Statistik dataset.
- `GET /api/lookup?word=<kata>&related=<true|false>` atau `GET /api/words/<kata>` — Lookup lema Mandar, turunan sublema, dan rujukan halaman PDF.
- `GET /api/search?q=<kata>&direction=<all|mandar|indonesia>&section=<A..W>&pos=<v|n|...>&type=<main|sub>&limit=25&offset=0` — Pencarian dua arah.
- `GET /api/sections` dan `GET /api/sections/<A..W>?type=<main|sub>&limit=50&offset=0` — Daftar kosakata per huruf.
- `GET /api/pages/<1..499>` — Kosakata berdasarkan nomor halaman kamus tercetak.
- `GET /api/entries/<id>` — Detail entri berdasarkan ID (mis. `mdr-0001`).
- `GET /api/source/pdf` — Streaming berkas PDF acuan resmi (`application/pdf`).

## Penggunaan sebagai Modul Library Server

```js
const { KamusMandarDataset } = require('./src/dataset-server');

const dictionary = new KamusMandarDataset().load();

// Cek lema Mandar beserta sublema turunan dan rujukan halaman PDF
const detail = dictionary.lookup('acar');

// Pencarian kosakata dua arah (Mandar <-> Indonesia)
const hasil = dictionary.search('ayah', { direction: 'indonesia', limit: 10 });

// Ambil daftar lema berdasarkan huruf atau nomor halaman buku
const seksiB = dictionary.getSection('B', { limit: 25, offset: 0 });
const hal1 = dictionary.getByBookPage(1);
```

## Perintah CLI & Verifikasi

Pastikan Node.js tersedia di `PATH` (contoh di lingkungan ini: `D:\NODEJS\node-v26.13.0-win-x64`):

```powershell
# Membangun ulang manifest.json & vocabulary.json langsung dari PDF acuan
node scripts/build-dataset.js

# Verifikasi kesinkronan indeks JSON terhadap PDF resmi & jalankan seluruh tes
npm run verify

# Contoh kueri langsung dari CLI
node src/dataset-server.js verify
node src/dataset-server.js stats
node src/dataset-server.js lookup maacar
node src/dataset-server.js search ayah
node src/dataset-server.js page 499
```
