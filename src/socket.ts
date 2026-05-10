import { io } from "socket.io-client";

// Sesuaikan URL ini saat nanti sudah di-hosting (misal: https://api.typeltug.com)
// Untuk lokal atau tes beda device, gunakan hostname otomatis dari URL browser
export const socket = io(`http://${window.location.hostname}:3001`, {
  autoConnect: false, // Jangan otomatis connect sampai user klik Mulai/Gabung
});
