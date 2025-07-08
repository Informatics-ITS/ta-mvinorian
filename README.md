# 🏁 Tugas Akhir (TA) - Final Project

**Nama Mahasiswa**: Muhammad Ersya Vinorian

**NRP**: 5025211045

**Judul TA**: Rancang Bangun Aplikasi Web “Node Clash”: Permainan Edukatif Penyerangan Dan Pertahanan Keamanan Siber

**Dosen Pembimbing**: Baskoro Adi Pratomo, S.Kom., M.Kom., Ph.D.

**Dosen Ko-pembimbing**: Hadziq Fabroyir, S.Kom., Ph.D.

---

## 📺 Demo Aplikasi  

[![Demo Aplikasi](https://i.ytimg.com/vi/I0pW_E2CAKA/maxresdefault.jpg)](https://www.youtube.com/watch?v=I0pW_E2CAKA)  
*Klik gambar di atas untuk menonton demo*

---

## 🛠 Panduan Instalasi & Menjalankan Software  

### Prasyarat  
- Memiliki Docker terinstal

### Langkah-langkah  
1. **Clone Repository**  

   ```bash
   git clone https://github.com/Informatics-ITS/ta-mvinorian
   ```
2. **Konfigurasi Aplikasi**

   - Masuk ke direktori aplikasi.

      ```bash
      cd ta-mvinorian
      ```

   - Salin file `.env.example` menjadi `.env`.

      ```bash
      cp .env.example .env
      ```
   
   - Sesuaikan variabel di file `.env` untuk database sesuai dengan keinginan Anda (tidak perlu membuat database secara manual, akan dibuat otomatis oleh Docker).

      ```env
      DB_NAME=nama_database
      DB_USER=nama_user
      DB_PASSWORD=password_user
      DB_URL=postgresql://DB_NAME:DB_PASSWORD@db:5432/DB_NAME
      ```

   - Jalankan perintah berikut dan salin hasilnya ke dalam variabel `JWT_SECRET` di file `.env`.

      ```bash
      openssl rand -base64 64
      ```

   - Jalankan perintah berikut dan salin hasilnya ke dalam variabel `NEXT_PUBLIC_COOKIE_SECRET` di file `.env`.

      ```bash
      openssl rand -hex 32
      ```

3. **Menjalankan di Lokal**
   
   Aplikasi dapat dijalankan di lokal menggunakan Docker Compose. Pastikan Anda berada di direktori aplikasi, lalu jalankan perintah berikut.

   ```bash
   docker compose up --build
   ```
   
4. **Akses Aplikasi**

   Setelah proses build selesai, buka browser dan akses aplikasi di alamat berikut.

   ```
   http://localhost:3434
   ```

## ⁉️ Pertanyaan?

Hubungi:
- Penulis: [mvinorian@gmail.com](mailto:mvinorian@gmail.com)
- Pembimbing Utama: [baskoro@its.ac.id](mailto:baskoro@its.ac.id)
