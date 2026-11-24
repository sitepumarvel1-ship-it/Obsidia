# Obsidia

Aplikasi chat AI pribadi yang memakai API gratis dari berbagai penyedia. Semua chat, proyek, memori, dan API key tersimpan di browser perangkatmu sendiri.

## Isi folder

| Berkas | Fungsi |
|---|---|
| `index.html` | Aplikasi Obsidia (semua tampilan dan logika ada di sini) |
| `manifest.webmanifest` | Agar bisa dipasang seperti aplikasi di HP |
| `sw.js` | Membuat aplikasi cepat dibuka dan tetap terbuka saat offline |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`, `apple-touch-icon.png` | Logo Obsidia |

## Cara pasang di GitHub Pages

1. Masuk ke github.com, lalu buat repository baru, misalnya `obsidia`. Pilih **Public** (GitHub Pages gratis hanya untuk repo publik).
2. Di halaman repo, klik **Add file > Upload files**, lalu seret semua berkas di atas (tanpa folder `src`). Klik **Commit changes**.
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
