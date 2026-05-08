# Sistem Pengelolaan Sampah

Sistem Pengelolaan Sampah adalah aplikasi berbasis web yang dirancang untuk membantu dalam manajemen, pemantauan, dan penjadwalan pengambilan sampah di berbagai Tempat Pembuangan Sementara (TPS). Aplikasi ini menyediakan pemetaan interaktif, pelacakan armada, manajemen logbook, serta dashboard administratif untuk menganalisis data secara real-time.

## 🌟 Fitur Utama

- **Pemetaan TPS Interaktif:** Visualisasi lokasi TPS menggunakan Leaflet dengan penanda (marker) yang dapat diklik untuk melihat detail dan status volume sampah.
- **Manajemen Status TPS Dinamis:** Perhitungan otomatis status TPS (Aman, Peringatan, Penuh) berdasarkan volume sampah aktual.
- **Sistem Logbook & Penjadwalan:** Fitur untuk menugaskan kendaraan pengangkut, melihat jadwal hari ini, dan melacak riwayat logbook pengangkutan sampah.
- **Dashboard Analitik:** Menampilkan statistik pengelolaan sampah, tingkat kepatuhan jadwal, dan peringkat kinerja armada.
- **Sistem Autentikasi:** Keamanan berbasis JWT dan Bcrypt untuk manajemen pengguna (admin/petugas).
- **Notifikasi/Pelaporan:** Kemampuan bagi pengguna untuk melaporkan masalah langsung dari peta.
- **Pekerjaan Latar Belakang (Cron Jobs):** Otomatisasi untuk memperbarui status harian dan merekapitulasi tugas yang sudah selesai.

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **HTTP Client:** Axios
- **Peta & Geospasial:** Leaflet & Leaflet.markercluster
- **Grafik:** Chart.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (dengan `mysql2`)
- **Autentikasi:** JSON Web Token (JWT) & bcrypt
- **Upload File:** Multer
- **Tugas Terjadwal (Cron):** node-cron
- **Keamanan & Performa:** cors, express-rate-limit

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (Versi 20.x atau terbaru yang kompatibel)
- [MySQL](https://www.mysql.com/) (atau MariaDB / Laragon)
- Git

## 🚀 Instalasi & Persiapan

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek secara lokal.

### 1. Clone Repositori

```bash
git clone <url-repositori-anda>
cd Sistem-Pengelolaan-Sampah
```

### 2. Setup Database
1. Buat database baru di MySQL dengan nama yang sesuai (misal: `db_pengelolaan_sampah`).
2. Impor skema database jika tersedia (biasanya berupa file `.sql`).

### 3. Setup Backend

Buka terminal baru dan arahkan ke folder `backend`:

```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend` (lihat bagian [Konfigurasi Environment](#-konfigurasi-environment)).

Jalankan server backend:

```bash
# Untuk mode development
npm run dev

# (Atau) jalankan langsung
node server.js
```
*Server berjalan secara default pada port yang ditentukan di `.env` (misalnya: 5000).*

### 4. Setup Frontend

Buka terminal baru dan arahkan ke folder `frontend`:

```bash
cd frontend
npm install
```

Buat file `.env` di dalam folder `frontend` (jika diperlukan) untuk mengatur Base URL dari API Backend.

Jalankan aplikasi frontend:

```bash
npm run dev
```
*Frontend biasanya akan berjalan di `http://localhost:5173`.*

## ⚙️ Konfigurasi Environment

### Backend (`backend/.env`)

Buat file `.env` di direktori `backend` dan sesuaikan dengan konfigurasi Anda. Contoh:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_pengelolaan_sampah
JWT_SECRET=rahasia_jwt_anda
```

### Frontend (`frontend/.env`)

Buat file `.env` di direktori `frontend`:

```env
VITE_API_URL=http://localhost:5000
```

## 📂 Struktur Proyek

```text
Sistem-Pengelolaan-Sampah/
├── backend/                # Source code untuk REST API (Express + Node.js)
│   ├── src/                # Controller, Route, Model
│   ├── uploads/            # Direktori untuk file yang diunggah
│   ├── server.js           # Entry point backend
│   └── package.json        # Dependensi backend
│
└── frontend/               # Source code untuk Antarmuka Pengguna (Vue 3 + Vite)
    ├── public/             # Aset publik statis
    ├── src/                # Komponen, Views, Router, Stores (Pinia)
    ├── vite.config.js      # Konfigurasi Vite
    └── package.json        # Dependensi frontend
```
