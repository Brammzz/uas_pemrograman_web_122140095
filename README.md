# Roomify - Hotel Room Booking Application

![React](https://img.shields.io/badge/React-19.1.0-blue) ![Pyramid](https://img.shields.io/badge/Pyramid-1.9+-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blueviolet) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Overview
Roomify adalah aplikasi web pemesanan kamar hotel yang dibangun dengan arsitektur modern menggunakan React untuk frontend dan Pyramid Framework (Python) untuk backend. Aplikasi ini menyediakan platform bagi pengguna untuk menjelajahi, memesan, dan mengelola reservasi kamar hotel, serta panel admin untuk mengelola kamar, pemesanan, dan pengguna.

![image](https://github.com/user-attachments/assets/3c2af171-b335-49b1-b762-5a7b99f2cb9e)

## Project Structure
The project is divided into two main parts:
- **roomify_frontend**: React-based frontend application
- **roomify_backend**: Pyramid-based backend API server

## Technologies Used

### Frontend
- **React 19**: Library JavaScript untuk membangun antarmuka pengguna yang interaktif
- **React Router 7**: Untuk navigasi dan routing antar halaman
- **Tailwind CSS**: Framework CSS untuk styling yang cepat dan responsif
- **Material UI 7**: Komponen UI yang elegan dan konsisten
- **Axios**: Untuk HTTP requests ke backend API
- **React Query**: Untuk manajemen state server dan caching
- **Context API**: Untuk state management di seluruh aplikasi
- **Lucide React**: Untuk ikon-ikon modern dan konsisten

### Backend
- **Python**: Bahasa pemrograman yang kuat dan fleksibel
- **Pyramid Framework**: Framework web Python yang skalabel
- **SQLAlchemy ORM**: Untuk abstraksi database dan query
- **Alembic**: Untuk migrasi database yang aman
- **JWT**: Untuk autentikasi berbasis token
- **CORS**: Untuk menangani Cross-Origin Resource Sharing
- **SQLite**: Database ringan untuk development (dapat dikonfigurasi untuk PostgreSQL di production)

## Features

### User Features
- ✅ **Autentikasi Pengguna**: Registrasi dan login dengan validasi data
- ✅ **Pencarian Kamar**: Jelajahi kamar tersedia dengan opsi filter
- ✅ **Detail Kamar**: Informasi lengkap dengan galeri foto dan fasilitas
- ✅ **Pemesanan Kamar**: Sistem pemesanan dengan pemilihan tanggal dan jumlah tamu
- ✅ **Manajemen Pemesanan**: Lihat dan kelola riwayat pemesanan
- ✅ **Profil Pengguna**: Kelola informasi profil dan preferensi
- ✅ **Notifikasi**: Dapatkan pemberitahuan tentang status pemesanan
- ✅ **Responsif**: Desain yang bekerja dengan baik di desktop dan mobile

### Admin Features
- ✅ **Dashboard Admin**: Panel kontrol dengan statistik dan metrik
- ✅ **Manajemen Kamar**: Tambah, edit, dan hapus kamar dengan upload gambar
- ✅ **Manajemen Pemesanan**: Lihat dan kelola semua pemesanan
- ✅ **Manajemen Pengguna**: Pantau dan kelola akun pengguna
- ✅ **Analitik**: Laporan dan statistik tentang pemesanan dan pendapatan
- ✅ **Pengaturan Sistem**: Konfigurasi parameter aplikasi

## Database Models

### User Model
- Fields: id, username, email, password, full_name, phone_number, is_admin, created_at, updated_at
- Relationships: bookings (one-to-many)

### Room Model
- Fields: id, name, description, price_per_night, capacity, room_type, is_available, image_url, amenities, created_at, updated_at
- Relationships: bookings (one-to-many)

### Booking Model
- Fields: id, user_id, room_id, check_in_date, check_out_date, guests, total_price, status, special_requests, created_at, updated_at
- Relationships: user (many-to-one), room (many-to-one)

### Review Model
- Fields: id, user_id, room_id, booking_id, rating, comment, created_at, updated_at
- Relationships: user, room, booking

### Token Model
- Fields: id, user_id, token, is_admin, expires_at, created_at
- Relationships: user
- Methods: create_token, is_valid

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - User login
- POST `/api/admin/login` - Admin login
- GET `/api/profile` - Get user profile

### Rooms
- GET `/api/rooms` - Get all rooms
- GET `/api/rooms/{id}` - Get room details
- POST `/api/rooms` - Create a new room (admin only)
- PUT `/api/rooms/{id}` - Update room (admin only)
- DELETE `/api/rooms/{id}` - Delete room (admin only)

### Bookings
- GET `/api/bookings` - Get user bookings
- POST `/api/bookings` - Create a new booking
- GET `/api/bookings/{id}` - Get booking details
- PUT `/api/bookings/{id}` - Update booking
- DELETE `/api/bookings/{id}` - Cancel booking
- GET `/api/admin/bookings` - Get all bookings (admin only)

## Setup and Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- npm atau yarn
- pip
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd roomify_backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```
   pip install -e .
   ```

4. Initialize the database:
   ```
   initialize_roomify_backend_db development.ini
   ```

5. Start the backend server:
   ```
   pserve development.ini
   ```
   The server will run on http://localhost:6543

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd roomify_frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The application will run on http://localhost:3000

## Deployment
- The backend can be deployed to any WSGI-compatible server
- The frontend can be built for production using `npm run build` and deployed to any static hosting service

## Pengembangan Selanjutnya

Berikut adalah beberapa fitur yang direncanakan untuk pengembangan selanjutnya:

- [ ] Integrasi dengan sistem pembayaran online
- [ ] Sistem ulasan dan rating untuk kamar
- [ ] Fitur pencarian lanjutan dengan filter tambahan
- [ ] Implementasi PWA (Progressive Web App)
- [ ] Optimasi performa dan caching
- [ ] Fitur multi-bahasa

## Kontribusi

Kontribusi selalu diterima! Berikut adalah langkah-langkah untuk berkontribusi:

1. Fork repositori ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Troubleshooting

### Masalah Umum
- **Gambar tidak muncul**: Pastikan backend server berjalan dan folder `static/images` memiliki izin yang benar
- **Error CORS**: Pastikan CORS diaktifkan di backend dan URL frontend terdaftar di whitelist
- **Database error**: Coba jalankan migrasi ulang dengan `alembic upgrade head`

## License
[MIT License](LICENSE)

## Author
[Abraham Ganda Napitu] - [122140095] - [abraham.122140095@student.itera.ac.id]

## Acknowledgements
- Proyek ini dibuat sebagai bagian dari mata kuliah Pemrograman Web
- Terima kasih khusus kepada [Nama Dosen/Instruktur Anda]
- Inspirasi desain dari berbagai aplikasi pemesanan hotel populer
