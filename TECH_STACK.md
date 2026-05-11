# 🛠️ TECH STACK - TypeTug Game

Dokumentasi lengkap tentang semua tools, teknologi, dan library yang digunakan dalam project TypeTug.

---

## 📋 **DAFTAR ISI**
1. [Frontend Framework & Library](#frontend-framework--library)
2. [Backend & Real-time Communication](#backend--real-time-communication)
3. [Build Tools & Development](#build-tools--development)
4. [UI Components & Styling](#ui-components--styling)
5. [Utilities & Helper Libraries](#utilities--helper-libraries)
6. [TypeScript & Type Safety](#typescript--type-safety)
7. [Deployment & Hosting](#deployment--hosting)

---

## 🎨 **FRONTEND FRAMEWORK & LIBRARY**

### **React 18.3.1**
- **Fungsi**: Library JavaScript untuk membangun user interface
- **Kenapa dipakai**: 
  - Component-based architecture yang modular
  - Virtual DOM untuk performa optimal
  - Hooks untuk state management yang clean
  - Ecosystem yang besar dan mature
- **Digunakan untuk**: Semua komponen UI game (GamePage, LobbyPage, StartPage, TypingArea, TugScene, dll)

### **React Router 7.13.0**
- **Fungsi**: Library untuk routing dan navigasi antar halaman
- **Kenapa dipakai**: 
  - Single Page Application (SPA) routing
  - Passing state antar halaman
  - Programmatic navigation
- **Digunakan untuk**: 
  - Navigasi dari StartPage → LobbyPage → GamePage
  - Passing data seperti nama player, kode room, mode permainan

### **React DOM 18.3.1**
- **Fungsi**: Package untuk rendering React ke DOM browser
- **Kenapa dipakai**: Bridge antara React components dan browser DOM
- **Digunakan untuk**: Mounting aplikasi React ke `index.html`

---

## 🔌 **BACKEND & REAL-TIME COMMUNICATION**

### **Socket.IO 4.8.3** (Server)
- **Fungsi**: Library untuk real-time, bidirectional communication antara client dan server
- **Kenapa dipakai**:
  - WebSocket dengan fallback ke HTTP long-polling
  - Room-based communication untuk multiplayer
  - Automatic reconnection
  - Event-based architecture
- **Digunakan untuk**:
  - Multiplayer game synchronization
  - Real-time progress updates (WPM, accuracy, progress bar)
  - Room management (create, join, leave)
  - Game state synchronization (start, countdown, finish)
  - Rematch system

### **Socket.IO Client 4.8.3**
- **Fungsi**: Client-side library untuk koneksi ke Socket.IO server
- **Kenapa dipakai**: Komunikasi real-time dari browser ke server
- **Digunakan untuk**:
  - Emit events: `createRoom`, `joinRoom`, `startGame`, `updateProgress`
  - Listen events: `roomReady`, `gameStarted`, `opponentProgress`, `rematchRequested`

### **Node.js HTTP Server**
- **Fungsi**: Built-in HTTP server dari Node.js
- **Kenapa dipakai**: Lightweight server untuk Socket.IO
- **Digunakan untuk**: Hosting WebSocket server di `server.js`

---

## ⚡ **BUILD TOOLS & DEVELOPMENT**

### **Vite 6.3.5**
- **Fungsi**: Next-generation frontend build tool
- **Kenapa dipakai**:
  - ⚡ Lightning-fast Hot Module Replacement (HMR)
  - 📦 Optimized production builds
  - 🔧 Zero-config untuk React + TypeScript
  - 🚀 Native ES modules support
- **Digunakan untuk**:
  - Development server (`npm run dev`)
  - Production build (`npm run build`)
  - Asset optimization (images, fonts, CSS)

### **@vitejs/plugin-react 4.7.0**
- **Fungsi**: Official Vite plugin untuk React
- **Kenapa dipakai**: 
  - Fast Refresh untuk React components
  - JSX/TSX transformation
  - React optimization
- **Digunakan untuk**: Compile React components dengan Vite

### **TypeScript 6.0.3**
- **Fungsi**: Superset JavaScript dengan static typing
- **Kenapa dipakai**:
  - Type safety untuk mencegah bugs
  - Better IDE autocomplete & IntelliSense
  - Self-documenting code
  - Refactoring yang lebih aman
- **Digunakan untuk**: Semua file `.ts` dan `.tsx` dalam project

### **@types/react & @types/react-dom**
- **Fungsi**: Type definitions untuk React
- **Kenapa dipakai**: TypeScript support untuk React API
- **Digunakan untuk**: Type checking React components dan hooks

### **@types/node**
- **Fungsi**: Type definitions untuk Node.js
- **Kenapa dipakai**: TypeScript support untuk Node.js API
- **Digunakan untuk**: Type checking di `server.js` dan Vite config

---

## 🎨 **UI COMPONENTS & STYLING**

### **Tailwind CSS 4.1.12**
- **Fungsi**: Utility-first CSS framework
- **Kenapa dipakai**:
  - Rapid UI development dengan utility classes
  - Consistent design system
  - Responsive design yang mudah
  - Tree-shaking untuk CSS yang tidak terpakai
- **Digunakan untuk**: Styling komponen UI (meskipun game ini lebih banyak inline styles untuk retro aesthetic)

### **@tailwindcss/vite 4.1.12**
- **Fungsi**: Tailwind CSS plugin untuk Vite
- **Kenapa dipakai**: Integrasi Tailwind dengan Vite build process
- **Digunakan untuk**: Compile Tailwind CSS saat development dan build

### **PostCSS**
- **Fungsi**: Tool untuk transforming CSS dengan JavaScript plugins
- **Kenapa dipakai**: Required oleh Tailwind CSS
- **Digunakan untuk**: Process Tailwind directives dan autoprefixer

### **Radix UI Components** (30+ packages)
- **Fungsi**: Unstyled, accessible UI component library
- **Kenapa dipakai**:
  - ♿ Accessibility-first (ARIA compliant)
  - 🎨 Unstyled (full styling control)
  - 🔧 Composable & customizable
  - 📱 Keyboard navigation support
- **Components yang tersedia**:
  - `@radix-ui/react-dialog` - Modal/Dialog
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-tooltip` - Tooltips
  - `@radix-ui/react-tabs` - Tab navigation
  - `@radix-ui/react-progress` - Progress bars
  - `@radix-ui/react-slider` - Sliders
  - `@radix-ui/react-switch` - Toggle switches
  - Dan 20+ komponen lainnya
- **Digunakan untuk**: Base components untuk UI elements (buttons, dialogs, tooltips, dll)

### **Material-UI (MUI) 7.3.5**
- **Fungsi**: React component library dengan Material Design
- **Kenapa dipakai**: 
  - Pre-built components yang polished
  - Consistent design language
  - Rich component ecosystem
- **Packages**:
  - `@mui/material` - Core components
  - `@mui/icons-material` - Material Design icons
  - `@emotion/react` & `@emotion/styled` - CSS-in-JS styling engine untuk MUI
- **Digunakan untuk**: Icons dan beberapa UI components

### **Lucide React 0.487.0**
- **Fungsi**: Icon library dengan 1000+ icons
- **Kenapa dipakai**:
  - Lightweight & tree-shakeable
  - Consistent design
  - Easy to customize
- **Digunakan untuk**: Icons di UI (play, pause, settings, dll)

### **Canvas Confetti 1.9.4**
- **Fungsi**: Library untuk confetti animation
- **Kenapa dipakai**: Celebratory effects saat menang
- **Digunakan untuk**: Animasi confetti di victory screen

---

## 🔧 **UTILITIES & HELPER LIBRARIES**

### **clsx 2.1.1**
- **Fungsi**: Utility untuk conditional className construction
- **Kenapa dipakai**: Clean conditional CSS classes
- **Contoh**: `clsx('btn', isActive && 'btn-active', 'btn-primary')`

### **tailwind-merge 3.2.0**
- **Fungsi**: Merge Tailwind CSS classes tanpa konflik
- **Kenapa dipakai**: Menghindari class conflicts saat merge utility classes
- **Contoh**: `twMerge('px-2 py-1', 'px-4')` → `'px-4 py-1'`

### **class-variance-authority 0.7.1**
- **Fungsi**: Library untuk membuat variant-based component APIs
- **Kenapa dipakai**: Type-safe component variants
- **Digunakan untuk**: Button variants, card variants, dll

### **date-fns 3.6.0**
- **Fungsi**: Modern JavaScript date utility library
- **Kenapa dipakai**: 
  - Lightweight alternative to Moment.js
  - Immutable & pure functions
  - Tree-shakeable
- **Digunakan untuk**: Date formatting, manipulation (jika ada fitur leaderboard/history)

### **cmdk 1.1.1**
- **Fungsi**: Command menu component (Command+K interface)
- **Kenapa dipakai**: Fast command palette untuk shortcuts
- **Digunakan untuk**: Quick actions menu (jika diimplementasikan)

---

## 🎮 **ANIMATION & INTERACTION**

### **Motion (Framer Motion) 12.23.24**
- **Fungsi**: Production-ready animation library untuk React
- **Kenapa dipakai**:
  - Declarative animations
  - Gesture support (drag, hover, tap)
  - Layout animations
  - SVG animations
- **Digunakan untuk**: 
  - Smooth transitions antar halaman
  - Popup animations
  - Rope tug animation
  - Character movements

### **Embla Carousel React 8.6.0**
- **Fungsi**: Lightweight carousel library
- **Kenapa dipakai**: 
  - Performant & lightweight
  - Touch/swipe support
  - Customizable
- **Digunakan untuk**: Carousel di lobby atau tutorial (jika ada)

### **React Slick 0.31.0**
- **Fungsi**: Carousel component built with React
- **Kenapa dipakai**: Alternative carousel dengan banyak features
- **Digunakan untuk**: Image sliders atau testimonials

---

## 📊 **DATA VISUALIZATION & CHARTS**

### **Recharts 2.15.2**
- **Fungsi**: Composable charting library untuk React
- **Kenapa dipakai**:
  - Built dengan React components
  - Responsive & customizable
  - Support berbagai chart types
- **Digunakan untuk**: 
  - WPM history chart (Sparkline component)
  - Performance statistics
  - Leaderboard visualizations

---

## 🎯 **FORM HANDLING**

### **React Hook Form 7.55.0**
- **Fungsi**: Performant form library dengan validation
- **Kenapa dipakai**:
  - Minimal re-renders
  - Easy validation
  - TypeScript support
  - Small bundle size
- **Digunakan untuk**: 
  - Login/register forms
  - Room creation form
  - Settings form

### **Input OTP 1.4.2**
- **Fungsi**: OTP (One-Time Password) input component
- **Kenapa dipakai**: User-friendly OTP input
- **Digunakan untuk**: Room code input (6-digit code)

---

## 🎨 **DRAG & DROP**

### **React DnD 16.0.1**
- **Fungsi**: Drag and Drop library untuk React
- **Kenapa dipakai**: 
  - Flexible & powerful
  - Touch support
  - Accessibility
- **Packages**:
  - `react-dnd` - Core library
  - `react-dnd-html5-backend` - HTML5 drag and drop backend
- **Digunakan untuk**: Drag and drop features (jika ada customization UI)

---

## 🎭 **THEMING & STYLING**

### **next-themes 0.4.6**
- **Fungsi**: Theme management untuk Next.js/React
- **Kenapa dipakai**: 
  - Dark/light mode toggle
  - System preference detection
  - No flash on load
- **Digunakan untuk**: Theme switching (retro/modern themes)

### **Sonner 2.0.3**
- **Fungsi**: Opinionated toast component untuk React
- **Kenapa dipakai**:
  - Beautiful default styling
  - Accessible
  - Customizable
- **Digunakan untuk**: Notifications (game start, player joined, errors)

### **Vaul 1.1.2**
- **Fungsi**: Drawer component untuk React
- **Kenapa dipakai**: Mobile-friendly drawer/sheet component
- **Digunakan untuk**: Mobile menu, settings drawer

---

## 🔐 **ENVIRONMENT & CONFIGURATION**

### **.env.example**
- **Fungsi**: Template untuk environment variables
- **Kenapa dipakai**: Secure configuration management
- **Variables**:
  - `PORT` - Server port (default: 3001)
  - `ALLOWED_ORIGINS` - CORS allowed origins

### **vercel.json**
- **Fungsi**: Vercel deployment configuration
- **Kenapa dipakai**: Deploy ke Vercel dengan custom settings
- **Digunakan untuk**: 
  - Routing rules
  - Build settings
  - Environment variables

---

## 📦 **PACKAGE MANAGER**

### **npm (Node Package Manager)**
- **Fungsi**: Default package manager untuk Node.js
- **Kenapa dipakai**: 
  - Comes with Node.js
  - Large registry
  - Lock file untuk consistent installs
- **Files**:
  - `package.json` - Dependencies & scripts
  - `package-lock.json` - Exact dependency tree

### **pnpm Override**
- **Fungsi**: Alternative package manager (optional)
- **Kenapa dipakai**: 
  - Faster than npm
  - Disk space efficient
  - Strict dependency resolution
- **Config**: `pnpm.overrides` di package.json

---

## 🚀 **DEPLOYMENT & HOSTING**

### **Vercel** (Recommended)
- **Fungsi**: Cloud platform untuk static sites & serverless functions
- **Kenapa dipakai**:
  - Zero-config deployment
  - Automatic HTTPS
  - Global CDN
  - Serverless functions untuk backend
- **Digunakan untuk**: 
  - Host frontend (Vite build)
  - Host WebSocket server (serverless function)

### **Alternative: Railway/Render**
- **Fungsi**: Platform untuk deploy full-stack apps
- **Kenapa dipakai**: Support WebSocket dengan persistent connections
- **Digunakan untuk**: Deploy frontend + backend together

---

## 📁 **PROJECT STRUCTURE**

```
typetug-game/
├── src/
│   ├── app/
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Radix UI components
│   │   │   ├── TypingArea.tsx
│   │   │   ├── TugScene.tsx
│   │   │   └── PlayerPanel.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── StartPage.tsx
│   │   │   ├── LobbyPage.tsx
│   │   │   └── GamePage.tsx
│   │   └── routes.tsx       # React Router config
│   ├── assets/              # Images, fonts, etc
│   ├── socket.ts            # Socket.IO client setup
│   └── main.tsx             # App entry point
├── server.js                # Socket.IO server
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── package.json             # Dependencies & scripts
└── vercel.json              # Vercel deployment config
```

---

## 🎯 **SCRIPTS NPM**

```json
{
  "dev": "vite --host",           // Development server dengan HMR
  "build": "vite build",          // Production build
  "preview": "vite preview",      // Preview production build
  "start": "node server.js"       // Start WebSocket server
}
```

### **Cara Menjalankan:**

1. **Development (Frontend + Backend)**:
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   npm start
   ```

2. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔍 **KENAPA TECH STACK INI?**

### **Performa** ⚡
- **Vite**: Build time 10x lebih cepat dari Webpack
- **React 18**: Concurrent rendering untuk smooth animations
- **Socket.IO**: Efficient real-time communication

### **Developer Experience** 👨‍💻
- **TypeScript**: Catch errors sebelum runtime
- **Vite HMR**: Instant feedback saat coding
- **React Hooks**: Clean & readable code

### **User Experience** 🎮
- **Motion**: Smooth 60fps animations
- **Socket.IO**: Real-time multiplayer tanpa lag
- **Radix UI**: Accessible untuk semua users

### **Scalability** 📈
- **Component-based**: Easy to add new features
- **Type-safe**: Refactoring tanpa breaking changes
- **Modular**: Setiap feature independent

### **Production-Ready** 🚀
- **Optimized builds**: Code splitting & tree shaking
- **SEO-friendly**: Server-side rendering ready
- **Cross-browser**: Polyfills & fallbacks

---

## 📚 **RESOURCES & DOCUMENTATION**

- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Socket.IO**: https://socket.io
- **Tailwind CSS**: https://tailwindcss.com
- **Radix UI**: https://radix-ui.com
- **TypeScript**: https://typescriptlang.org
- **Framer Motion**: https://framer.com/motion

---

## 🎓 **LEARNING PATH**

Untuk memahami project ini, pelajari dalam urutan:

1. **JavaScript Fundamentals** → ES6+, async/await, modules
2. **React Basics** → Components, props, state, hooks
3. **TypeScript** → Types, interfaces, generics
4. **React Router** → Navigation, routing
5. **Socket.IO** → WebSocket, events, rooms
6. **Vite** → Build tools, bundling
7. **Tailwind CSS** → Utility-first CSS
8. **Framer Motion** → Animations

---

**Dibuat dengan ❤️ untuk TypeTug Game**
