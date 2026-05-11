import { io } from "socket.io-client";

// Konfigurasi URL socket berdasarkan environment
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:3001`;

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Jangan otomatis connect sampai user klik Mulai/Gabung
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 10000,
});
