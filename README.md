# 🎮 TypeTug - Multiplayer Typing Game

TypeTug adalah game typing multiplayer real-time dengan tema tug-of-war (tarik tambang). Pemain berkompetisi dengan mengetik kata-kata secepat mungkin untuk menarik tali ke arah mereka.

## ✨ Fitur

- 🎯 **Mode Bot**: Bermain melawan AI dengan tingkat kesulitan yang dapat disesuaikan
- 👥 **Mode Multiplayer**: Bermain real-time dengan pemain lain menggunakan kode room
- 🔐 **Autentikasi**: Login dengan email/password atau Google OAuth
- 🏆 **Sistem 3 Round**: Round 1, Round 2, dan Sudden Death (jika draw)
- 📊 **Statistik Real-time**: KPM (Kata Per Menit) dan Akurasi
- 🎨 **Retro Pixel Art Style**: Desain visual bergaya arcade klasik
- 🔄 **WebSocket Sync**: Sinkronisasi sempurna antar pemain

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js (v18 atau lebih baru)
- npm atau pnpm

### Instalasi

1. Clone repository:
```bash
git clone https://github.com/Azharsyam22/game-typetug.git
cd game-typetug
```

2. Install dependencies:
```bash
npm install
```

3. Copy file environment:
```bash
cp .env.example .env
```

4. **(Opsional)** Setup Google OAuth:
   - Lihat panduan lengkap di [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
   - Dapatkan Client ID dari [Google Cloud Console](https://console.cloud.google.com/)
   - Tambahkan ke `.env`: `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`

5. Jalankan server WebSocket (terminal 1):
```bash
npm start
```

6. Jalankan development server (terminal 2):
```bash
npm run dev
```

7. Buka browser di `http://localhost:5173`

## 🏗️ Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## 🎮 Cara Bermain

### Mode Bot
1. Klik "MAIN LAWAN BOT"
2. Masukkan nama Anda
3. Pilih tingkat kesulitan bot
4. Tekan SPASI untuk memulai
5. Ketik kata yang muncul dan tekan SPASI untuk konfirmasi

### Mode Multiplayer
1. **Host**: Klik "BUAT ROOM" → Bagikan kode room
2. **Join**: Klik "GABUNG ROOM" → Masukkan kode room
3. Salah satu pemain tekan SPASI untuk memulai
4. Ketik kata yang muncul dan tekan SPASI untuk konfirmasi

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Socket.IO
- **Styling**: Tailwind CSS, Custom CSS
- **UI Components**: Radix UI
- **Routing**: React Router v7

## 📁 Struktur Project

```
typetug/
├── src/
│   ├── app/
│   │   ├── components/     # Komponen React
│   │   ├── pages/          # Halaman utama
│   │   └── routes.tsx      # Konfigurasi routing
│   ├── assets/             # Gambar dan font
│   ├── styles/             # CSS files
│   ├── socket.ts           # Socket.IO client config
│   └── main.tsx            # Entry point
├── server.js               # WebSocket server
├── package.json
└── vite.config.ts
```

## 🌐 Deployment

### Vercel / Netlify (Frontend)
1. Build project: `npm run build`
2. Deploy folder `dist/`
3. Set environment variable: `VITE_SOCKET_URL=https://your-api-domain.com`

### Railway / Render (Backend)
1. Deploy `server.js`
2. Set environment variables:
   - `PORT=3001`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.com`

## 🔒 Keamanan

- ✅ CORS dikonfigurasi dengan whitelist domain
- ✅ Environment variables untuk konfigurasi sensitif
- ✅ Input validation di server
- ✅ Rate limiting untuk WebSocket events (recommended untuk production)

## 📝 License

MIT License

## 👨‍💻 Developer

Dikembangkan oleh [Azhar Syam](https://github.com/Azharsyam22)

## 🤝 Contributing

Pull requests are welcome! Untuk perubahan besar, silakan buka issue terlebih dahulu.

---

**Selamat Bermain! 🎮**
