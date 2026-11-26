# Obsidia

Aplikasi chat AI pribadi yang memakai API gratis dari berbagai penyedia. Semua chat, proyek, memori, dan API key tersimpan di browser perangkatmu sendiri.

## Isi folder

| Berkas | Fungsi |
|---|---|
| `index.html` | Aplikasi Obsidia (semua tampilan dan logika ada di sini) |
| `manifest.webmanifest` | Agar bisa dipasang seperti aplikasi di HP |
| `sw.js` | Membuat aplikasi cepat dibuka dan tetap terbuka saat offline |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`, `apple-touch-icon.png` | Logo Obsidia |
| `studio.js` | Studio Slide dan Studio Video |
| `pptxgen.bundle.js` | Pustaka pembuat file PowerPoint (PptxGenJS, lisensi MIT) |
| `relay/` | Server gratis untuk mode latar belakang (opsional, dipasang di Cloudflare) |

## Studio Slide dan Studio Video

Buka dari menu kiri. Keduanya memakai penyedia AI yang sudah kamu atur.

- **Studio Slide:** tekan **Buat dengan AI**, tulis topiknya, lalu atur template, warna (bisa dibuat dari satu warna atau diacak), font, dan animasi. **Presentasikan** menampilkan slide layar penuh dengan animasi. **PowerPoint** mengekspor `.pptx` (dengan transisi dan animasi masuk sederhana), **HTML** mengekspor presentasi yang bisa dibuka di browser mana pun dengan animasi lengkap.
- **Studio Video, mode Video AI dari foto:** pilih foto, tulis mau jadi video seperti apa (atau ketuk contoh gerakan), atur durasi (sampai 5 detik) dan kualitas, lalu tekan **Buat video**. Video dibuat gratis oleh model Wan 2.2 di Hugging Face. Kamu perlu akun Hugging Face dan token jenis **Read** dari huggingface.co/settings/tokens, tempel di bagian **Akun Hugging Face**. Kuota GPU gratis cukup untuk sekitar 2–3 video per hari dan pulih setelah 24 jam. Satu video makan waktu sekitar 1–5 menit, tergantung antrean. Bila mode latar belakang aktif, video dikerjakan di server sehingga Obsidia boleh ditutup; hasilnya muncul di daftar **Hasil video** saat Obsidia dibuka lagi. Tanpa mode latar belakang, biarkan Obsidia terbuka sampai selesai.
- **Studio Video, mode Video template:** pilih template (promo, story, edukasi, kutipan, slideshow foto, acara, tutorial, fakta), tekan **Buat dengan AI**, lalu atur adegan, animasi teks, transisi, musik, dan narasi. **Ekspor video** merekam video secara langsung, jadi durasi ekspor sama dengan durasi video. Biarkan layar menyala dan jangan pindah aplikasi selama ekspor.
- Di iPhone, file hasil ekspor muncul di menu Bagikan: pilih **Simpan Video** atau **Simpan ke File**.

## Cara pasang di GitHub Pages

1. Masuk ke github.com, lalu buat repository baru, misalnya `obsidia`. Pilih **Public** (GitHub Pages gratis hanya untuk repo publik).
2. Di halaman repo, klik **Add file > Upload files**, lalu seret semua berkas di atas **beserta folder `relay`**. Klik **Commit changes**.
3. Buka **Settings > Pages**. Di bagian **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1–2 menit. Alamat aplikasimu: `https://NAMA-AKUN.github.io/obsidia/`

Kode di repo memang publik, tapi itu aman: API key **tidak** ada di kode. Kunci hanya tersimpan di browser yang kamu pakai, jadi orang lain yang membuka alamat itu tidak bisa memakai kuotamu.

## Pasang di HP seperti aplikasi

- **iPhone (Safari):** buka alamatnya, ketuk tombol Bagikan, lalu **Tambahkan ke Layar Utama**.
- **Android (Chrome):** buka alamatnya, ketuk menu ⋮, lalu **Instal aplikasi** atau **Tambahkan ke layar utama**.

## Mengambil API key gratis

Buka **Pengaturan > Penyedia AI** di Obsidia, tempel kunci di penyedia yang kamu pilih, lalu tekan **Tes koneksi** dan **Muat daftar model**.

| Penyedia | Tempat membuat kunci | Catatan |
|---|---|---|
| Google Gemini | aistudio.google.com/apikey | Bisa membaca gambar. Isi chat di paket gratis bisa dipakai Google untuk melatih AI |
| Groq | console.groq.com/keys | Sangat cepat, batas token per menit kecil |
| OpenRouter | openrouter.ai/keys | Satu kunci untuk banyak model; model gratis berakhiran `:free` |
| Mistral | console.mistral.ai/api-keys | Bagus untuk menulis |
| Cerebras | cloud.cerebras.ai | Sangat cepat |
| GitHub Models | github.com/settings/personal-access-tokens | Token GitHub dengan izin Models |
| SambaNova | cloud.sambanova.ai/apis | Model open-source |
| Cohere | dashboard.cohere.com/api-keys | Kunci trial untuk pemakaian pribadi |
| Ollama | ollama.com/download | Offline dan tanpa batas di komputermu sendiri |
| Kustom | — | Penyedia lain yang memakai format OpenAI |

Kuota gratis tiap penyedia terbatas dan bisa berubah sewaktu-waktu. Isi beberapa penyedia, lalu biarkan opsi **pindah otomatis** menyala supaya Obsidia beralih ke penyedia lain saat satu penyedia penuh.

Jika sebuah penyedia selalu gagal terhubung padahal kuncinya benar, kemungkinan penyedia itu menolak akses langsung dari browser. Pakai penyedia lain atau OpenRouter.

## Memakai Ollama (gratis tanpa batas)

1. Pasang Ollama dari ollama.com, lalu unduh model, misalnya `ollama pull llama3.2`.
2. Jalankan Ollama dengan izin akses dari browser:
   - macOS/Linux: `OLLAMA_ORIGINS=* ollama serve`
   - Windows (PowerShell): `$env:OLLAMA_ORIGINS="*"; ollama serve`
3. Di Obsidia, buka **Pengaturan > Penyedia AI > Ollama**, centang **Aktifkan Ollama**, lalu tekan **Muat daftar model**.

Ollama hanya bisa dipakai dari komputer yang menjalankannya.

## Cadangan

Semua data ada di browser. Buka **Pengaturan > Data > Unduh cadangan** secara berkala. Untuk pindah ke HP atau komputer lain, buka Obsidia di sana lalu pilih **Pulihkan dari cadangan**. Menghapus data browser akan menghapus chat yang belum dicadangkan.

## Mode latar belakang (jawaban tetap jalan saat Obsidia ditutup)

Tanpa mode ini, jawaban berhenti saat kamu menutup Obsidia atau pindah aplikasi, karena iPhone menghentikan aplikasi web yang ditinggal. Dengan mode ini, jawaban dikerjakan di server gratis milikmu di Cloudflare. Kamu boleh menutup Obsidia, dan iPhone akan memberi notifikasi saat jawaban siap.

Yang dibutuhkan: repo GitHub Obsidia (Public) dan akun Cloudflare gratis.

### 1. Pastikan folder `relay` ada di repo

Isi repo harus memuat:

```
relay/src/index.js
relay/wrangler.jsonc
relay/package.json
relay/.dev.vars.example
```

`.dev.vars.example` adalah berkas tersembunyi. Kalau tidak ikut terunggah (sering terjadi di Mac atau iPhone), buat manual di GitHub: **Add file > Create new file**, ketik nama `relay/.dev.vars.example`, isi dengan baris `OBSIDIA_PASSWORD=`, lalu **Commit**. Cara yang sama bisa dipakai untuk berkas lain dari HP: ketik nama lengkap dengan garis miring (misalnya `relay/src/index.js`), lalu tempel isinya.

### 2. Pasang server dengan tombol Deploy

Buka alamat ini di browser (ganti `NAMA-AKUN` dengan nama akun GitHub-mu):

```
https://deploy.workers.cloudflare.com/?url=https://github.com/NAMA-AKUN/obsidia/tree/main/relay
```

1. Masuk atau daftar Cloudflare (gratis), lalu sambungkan akun GitHub saat diminta.
2. Saat diminta **OBSIDIA_PASSWORD**, buat kata sandi panjang (minimal 16 karakter) dan simpan baik-baik.
3. Tekan **Deploy** dan tunggu sampai selesai.
4. Salin alamat server yang muncul, bentuknya `https://obsidia-relay.NAMAMU.workers.dev`.

Kalau kata sandi tidak ditanyakan: buka dashboard Cloudflare > **Workers & Pages** > `obsidia-relay` > **Settings** > **Variables and Secrets** > **Add**, pilih tipe **Secret**, nama `OBSIDIA_PASSWORD`, isi kata sandimu, lalu **Deploy**.

Punya komputer dengan Node.js? Cara lain: buka folder `relay` di terminal, jalankan `npx wrangler deploy`, lalu `npx wrangler secret put OBSIDIA_PASSWORD`.

### 3. Sambungkan Obsidia

1. Di iPhone, buka Obsidia **dari ikon di Layar Utama** (bukan dari Safari).
2. Buka **Pengaturan > Latar belakang**, tempel alamat server dan kata sandi, lalu tekan **Tes server**.
3. Centang **Kerjakan jawaban di server**.
4. Tekan **Aktifkan notifikasi**, lalu izinkan.
5. Tekan **Kirim notifikasi uji**, lalu kunci layar. Notifikasi dari Obsidia akan muncul.

Setelah itu, setiap pesan baru dikerjakan di server. Ketuk notifikasi "Jawaban siap" untuk langsung membuka chat-nya.

### Catatan

- Paket gratis Cloudflare cukup untuk pemakaian pribadi. Satu jawaban dibatasi sekitar 13 menit.
- Saat mode ini aktif, jawaban muncul sekaligus setelah selesai, tidak mengetik huruf demi huruf.
- Ollama tetap dijawab langsung karena berjalan di komputermu.
- Server hanya mau melayani permintaan dengan kata sandimu. API key ikut dikirim ke server saat ada tugas, lalu dihapus begitu jawaban selesai. Jawaban dihapus dari server setelah diambil Obsidia, atau paling lambat 24 jam.
- Penyedia yang menolak akses langsung dari browser biasanya tetap bisa dipakai lewat server.
- Video AI juga dikerjakan di server bila mode ini aktif. Token Hugging Face dan foto dihapus dari server begitu video selesai, dan videonya dihapus setelah diambil Obsidia.
- **Sudah memasang server sebelum fitur Video AI ada?** Ganti file `relay/src/index.js` di repo GitHub-mu dengan versi baru dari paket ini. Cloudflare memasang ulang server secara otomatis dalam 1–2 menit.
