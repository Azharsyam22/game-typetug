import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { TypingArea } from "../components/TypingArea";
import { TugScene } from "../components/TugScene";
import { socket } from "../../socket";
import redTeamLogo from "../../assets/image/red-team-logo.png";
import blueTeamLogo from "../../assets/image/blue-team-logo.png";

// ── Pool Kata Pendek (4-5 huruf) — diacak tiap match ───────────────────────────
const KATA_POOL = [
  // 4 huruf
  "buku", "meja", "pena", "bola", "kuda", "sapi", "gigi", "kaki", "mata",
  "tahu", "roti", "susu", "anak", "ayah", "batu", "bumi", "daun", "emas",
  "gula", "ikan", "jari", "kayu", "kopi", "laut", "madu", "nasi", "padi",
  "raja", "satu", "tiga", "lima", "hari", "baru", "coba", "diam", "hati",
  "kuat", "lama", "maju", "naik", "atau", "tapi", "juga", "yang", "dari",
  "oleh", "pada", "akan", "jika", "bila", "maka", "lagi", "bisa", "kita",
  "saya", "kamu", "kami", "para", "saja", "atas", "baik", "baju", "bayi",
  "buah", "sama", "guru", "haus", "ikut", "jago", "jamu", "jauh", "jual",
  "kala", "kali", "kaya", "kena", "keju", "kera", "kira", "kiri", "kota",
  "labu", "laku", "lari", "lesu", "luka", "lupa", "lucu", "mana", "mati",
  "muda", "mutu", "naga", "niat", "pagi", "paha", "paku", "papa", "paus",
  "pilu", "pipi", "pita", "pula", "raba", "raga", "rasa", "ratu", "rela",
  "riba", "ribu", "rupa", "rusa", "sana", "sapu", "siap", "siku", "sini",
  "suka", "suku", "tali", "tamu", "topi", "ulat", "umat", "umum", "undi",
  "unta", "upah", "urat", "usap", "usir", "utuh", "wali", "kaca", "duka",
  "duta", "elok", "enak", "giat", "guna", "jeda", "jeli", "jiwa", "joki",
  "bela", "beri", "biru", "ikat", "imut", "rapi", "sepi", "beda", "bawa",
  "muka", "mega", "ragu", "sela", "soal", "tata", "zona", "loba",
  "seru", "unik", "sial", "dulu", "peka",
  // 5 huruf
  "bulan", "dalam", "sudah", "belum", "lebih", "dekat", "duduk", "harap",
  "ingat", "jawab", "kalau", "makin", "milik", "mulai", "nomor", "orang",
  "pakai", "pergi", "pikir", "sakit", "teman", "tidur", "tidak", "tiada",
  "turun", "warna", "yakin", "marah", "sedih", "takut", "benar", "salah",
  "keras", "lemah", "cepat", "bijak", "bodoh", "dapat", "darah", "depan",
  "deras", "gelap", "gemuk", "gempa", "gerak", "hidup", "hitam", "hujan",
  "hutan", "indah", "jatuh", "jeruk", "jumpa", "kabar", "kadar", "kaget",
  "kapal", "kapan", "kirim", "kotor", "kurus", "lapar", "lebar", "lepas",
  "lihat", "mahal", "manis", "masuk", "merah", "mimpi", "minum", "mobil",
  "motor", "murah", "mudah", "nanti", "nyata", "pahit", "paham", "panas",
  "pedas", "pelan", "penuh", "pesta", "petir", "pohon", "putih", "rajin",
  "ramah", "ramai", "rebah", "riang", "rusak", "sabun", "salam", "sehat",
  "semua", "seram", "serba", "sibuk", "sigap", "siram", "sopan", "subur",
  "susah", "tarik", "tebal", "tegak", "tegas", "tentu", "tepat", "terus",
  "tinju", "tipis", "tomat", "tukar", "turut", "ulang", "usaha", "utama",
  "bakar", "balap", "balik", "bantu", "barat", "batas", "bayar", "besok",
  "boros", "botak", "buaya", "bubuk", "bulat", "bunyi", "buruk", "cuaca",
  "cubit", "damai", "debat", "derek", "gagal", "galak", "gelak",
  "gigit", "gugur", "gulat", "gusar", "habis", "halus", "hantu",
  "hebat", "hemat", "jamur", "jinak", "juara", "judul",
  "kabur", "kagum", "kalah", "kenal", "kilat", "kocak", "kulit",
  "lapak", "latih", "lelah", "lirik", "lobak", "logam", "lolos",
  "mabuk", "macet", "makan", "malam", "malah", "mulus", "napas",
  "nakal", "nasib", "nekad", "obeng", "padat",
  "panik", "panen", "papan", "pasir", "patok", "payah", "pecah", "pecat",
  "penat", "perlu", "pilih", "pisah", "polos", "rabun",
  "racun", "radio", "raih", "rambu", "rapuh", "rawat",
  "retak", "ribet", "rindu", "robek", "roboh", "rogoh",
  "rujuk", "sabar", "sabuk", "sadap", "sahur", "sakti",
  "sandi", "sasar", "sawah", "sayap", "sebar", "sebab", "sebal", "sebut",
  "sedap", "segan", "sekat", "selip", "serap", "seret", "setan", "sikap",
  "sikat", "simak", "sisir", "sobek", "sorot", "sulit", "sumbu", "sumur",
  "surut", "tabah", "tabur", "tajam", "talas", "tanah", "tapak",
  "tekan", "telah", "telur", "tempa", "tempo", "tenda", "tikam",
  "timba", "tiram", "topan", "tobat", "tubuh", "tulus", "tunas", "ulung",
  "umbar", "usang", "usil", "viral",
  "walau", "wahyu", "wajib", "wajar", "waktu", "welas", "yaitu", "yatim",
  "zaman",
];

function acakKata(jumlah = 60): string[] {
  const pool = [...KATA_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const valid = [...new Set(pool)].filter(w => /^[a-z]+$/.test(w));
  return valid.slice(0, jumlah);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function useInterval(cb: () => void, ms: number | null) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

const DURASI = 60;

export default function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { nama?: string; kodeRoom?: string; isHost?: boolean; modePerm?: "bot" | "multiplayer"; wpmBot?: number } | null;

  const namaPlayer = state?.nama || "PX_REDNINJA";
  const kodeRoom = state?.kodeRoom || "------";
  const isMultiplayer = state?.modePerm === "multiplayer";
  const WPM_BOT_AKTIF = state?.wpmBot ?? 68;

  const namaMusuhDef = isMultiplayer ? "MENUNGGU..." : "BOT";
  const [namaMusuh, setNamaMusuh] = useState(namaMusuhDef);

  const [kata, setKata] = useState<string[]>(() => acakKata());

  const [fase, setFase] = useState<"menunggu" | "hitung" | "bermain" | "selesai">("menunggu");
  const [hitung, setHitung] = useState(3);
  const [waktuSisa, setWaktuSisa] = useState(DURASI);
  const [showCountdownPopup, setShowCountdownPopup] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [showFightPopup, setShowFightPopup] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);

  // Player typing state
  const [indekKata, setIndekKata] = useState(0);
  const [input, setInput] = useState("");
  const [bagianBenar, setBagianBenar] = useState("");
  const [bagianSalah, setBagianSalah] = useState("");
  const [kataBetul, setKataBetul] = useState(0);
  const [totalHuruf, setTotalHuruf] = useState(0);
  const [kesalahan, setKesalahan] = useState(0);
  const [wpmPlayer, setWpmPlayer] = useState(0);
  const [akuPlayer, setAkuPlayer] = useState(100);
  const [progresPlayer, setProgresPlayer] = useState(0);
  const [sedangKetik, setSedangKetik] = useState(false);

  // Bot state
  const [progresBot, setProgresBot] = useState(0);
  const [wpmBot, setWpmBot] = useState(0);
  const [akuBot, setAkuBot] = useState(92);
  const [benarBot, setBenarBot] = useState(0);
  const [salahBot, setSalahBot] = useState(0);

  // Rematch states
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchReceived, setRematchReceived] = useState(false);

  // Rope position: >50 = red winning
  const [posiTali, setPosiTali] = useState(50);
  const [pemenang, setPemenang] = useState<"merah" | "biru" | null>(null);
  
  const [lawanKeluar, setLawanKeluar] = useState(false);

  const waktuMulai = useRef(0);
  const timerKetik = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRiwayat = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── WebSocket Multiplayer Integration ───────────────────────────────────────
  useEffect(() => {
    if (isMultiplayer) {
      socket.connect();
      if (state?.isHost) {
        socket.emit("createRoom", { roomCode: kodeRoom, playerName: namaPlayer });
      } else {
        socket.emit("joinRoom", { roomCode: kodeRoom, playerName: namaPlayer });
      }

      socket.on("roomReady", ({ players }) => {
        // Cari nama musuh dari object players
        const op = Object.values(players).find((p: any) => p.name !== namaPlayer);
        if (op) setNamaMusuh((op as any).name);
        
        // Tidak auto-start, tunggu salah satu pemain pencet SPASI
      });

      socket.on("gameStarted", ({ startTime, sharedWords }) => {
        // Semua pemain mulai bersamaan ketika ada yang trigger
        // Gunakan kata yang sama dari server
        if (sharedWords && sharedWords.length > 0) {
          setKata(sharedWords);
        }
        mulaiPermainanRef.current();
      });

      // Single round - no round result events needed

      socket.on("gameSyncTime", ({ timeLeft }) => {
        // Sync waktu dari pemain lain untuk memastikan timer sinkron
        setWaktuSisa(timeLeft);
      });

      socket.on("opponentFinished", ({ round, playerId, finishedCount }) => {
        console.log(`Opponent finished round ${round}, count: ${finishedCount}`);
      });

      socket.on("bothPlayersFinished", ({ round }) => {
        console.log(`Both players finished round ${round}, triggering round end`);
        // Kedua pemain sudah selesai, pastikan akhiriPermainan dipanggil
        if (fase === "bermain") {
          akhiriPermainanRef.current();
        }
      });

      socket.on("opponentProgress", (data) => {
        setWpmBot(data.wpm);
        setAkuBot(data.accuracy);
        setProgresBot(data.progress);
        if (data.benar !== undefined) setBenarBot(data.benar);
        if (data.salah !== undefined) setSalahBot(data.salah);
      });

      socket.on("opponentLeft", () => {
        setLawanKeluar(true);
        setFase("selesai");
      });

      socket.on("opponentEndedGame", () => {
        akhiriPermainanDariSocketRef.current();
      });

      socket.on("joinError", (err) => {
        alert(err);
        navigate("/lobby");
      });

      return () => {
        socket.off("roomReady");
        socket.off("gameStarted");
        socket.off("gameSyncTime");
        socket.off("opponentFinished");
        socket.off("bothPlayersFinished");
        socket.off("opponentProgress");
        socket.off("opponentLeft");
        socket.off("joinError");
        socket.off("opponentEndedGame");
        socket.disconnect();
      };
    }
  }, [isMultiplayer, kodeRoom, namaPlayer, navigate, state?.isHost]);

  // ── Rematch Event Listeners (Separate useEffect) ────────────────────────────
  useEffect(() => {
    if (!isMultiplayer) return;

    console.log("🔧 Registering rematch event listeners");

    const handleRematchRequested = () => {
      console.log("🔔 Received rematchRequested event from opponent");
      setRematchReceived(true);
    };

    const handleRematchCancelled = () => {
      console.log("❌ Received rematchCancelled event from opponent");
      setRematchReceived(false);
      setRematchRequested(false);
    };

    const handleRematchAccepted = () => {
      console.log("✅ Received rematchAccepted event");
      setShowScorePopup(false);
      resetPermainan();
      
      setTimeout(() => {
        socket.emit("startGame", { roomCode: kodeRoom });
      }, 500);
    };

    socket.on("rematchRequested", handleRematchRequested);
    socket.on("rematchCancelled", handleRematchCancelled);
    socket.on("rematchAccepted", handleRematchAccepted);

    return () => {
      console.log("🔧 Cleaning up rematch event listeners");
      socket.off("rematchRequested", handleRematchRequested);
      socket.off("rematchCancelled", handleRematchCancelled);
      socket.off("rematchAccepted", handleRematchAccepted);
    };
  }, [isMultiplayer, kodeRoom]);

  // ── Emit Progress ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMultiplayer && fase === "bermain") {
      socket.emit("updateProgress", {
        roomCode: kodeRoom,
        wpm: wpmPlayer,
        accuracy: akuPlayer,
        progress: progresPlayer,
        score: kataBetul,
        benar: kataBetul,
        salah: kesalahan
      });
    }
  }, [wpmPlayer, akuPlayer, progresPlayer, kataBetul, kesalahan, fase, isMultiplayer, kodeRoom]);

  // ── Global space key — mulai/ulang saat menunggu/selesai ────────────────────
  const mulaiPermainanRef = useRef<() => void>(() => {});
  const akhiriPermainanRef = useRef<() => void>(() => {});
  const akhiriPermainanDariSocketRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (fase !== "menunggu" && fase !== "selesai") return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isMultiplayer) {
          // Multiplayer: siapa saja yang pencet SPASI, broadcast ke semua
          socket.emit("startGame", { roomCode: kodeRoom });
        } else {
          // Bot: langsung mulai
          mulaiPermainanRef.current();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fase, isMultiplayer, kodeRoom]);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useInterval(() => {
    if (fase !== "bermain") return;
    setWaktuSisa((t) => {
      if (t <= 1) { 
        akhiriPermainan(); 
        return 0; 
      }
      
      // Sync waktu setiap 5 detik untuk memastikan sinkronisasi
      if (isMultiplayer && t % 5 === 0) {
        socket.emit("syncGameTime", { roomCode: kodeRoom, timeLeft: t - 1 });
      }
      
      return t - 1;
    });
  }, fase === "bermain" ? 1000 : null);

  // ── Bot simulation ──────────────────────────────────────────────────────────
  useInterval(() => {
    if (isMultiplayer) return; // MATIKAN BOT JIKA MAIN ONLINE
    if (fase !== "bermain") return;
    const totalHurufTeks = kata.join(" ").length;
    const cps = (WPM_BOT_AKTIF * 5) / 60 / 4;
    const tambah = (cps / totalHurufTeks) * 100 * (0.65 + Math.random() * 0.7);
    setProgresBot((p) => Math.min(100, p + tambah));
    setWpmBot(Math.floor(WPM_BOT_AKTIF * (0.8 + Math.random() * 0.4)));
    setAkuBot(Math.floor(86 + Math.random() * 10));
  }, fase === "bermain" ? 250 : null);

  // ── Rope position update ─────────────────────────────────────────────────────
  useEffect(() => {
    if (progresPlayer + progresBot === 0) { setPosiTali(50); return; }
    const pos = clamp((progresPlayer / (progresPlayer + progresBot)) * 100, 8, 92);
    setPosiTali(pos);
    if (fase === "bermain") {
      if (pos >= 84) setPemenang("merah");
      else if (pos <= 16) setPemenang("biru");
    }
  }, [progresPlayer, progresBot, fase]);

  // ── WPM & Accuracy ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (fase === "bermain" && waktuMulai.current > 0) {
      const menit = (Date.now() - waktuMulai.current) / 60000;
      setWpmPlayer(menit > 0 ? Math.round(kataBetul / menit) : 0);
      const total = totalHuruf + kesalahan;
      setAkuPlayer(total > 0 ? Math.round((totalHuruf / total) * 100) : 100);
    }
  }, [kataBetul, totalHuruf, kesalahan, fase]);

  // ── Input handler ────────────────────────────────────────────────────────────
  const submitCurrentWord = useCallback((rawValue?: string) => {
    const target = kata[indekKata];
    const attempt = (rawValue ?? input).trim();

    if (!target) return;

    if (attempt === target) {
      const baru = indekKata + 1;
      setKataBetul((c) => c + 1);
      setTotalHuruf((t) => t + target.length);
      setIndekKata(baru);
      setInput("");
      setBagianBenar("");
      setBagianSalah("");
      setProgresPlayer(Math.round((baru / 40) * 100));
      if (baru >= kata.length - 15) {
        setKata((prev) => [...prev, ...acakKata()]);
      }
    } else {
      setInput(attempt);
      setKesalahan((e) => e + 1);
    }
  }, [indekKata, input, kata]);

  const handleInput = useCallback((nilai: string) => {
    if (fase !== "bermain") return;

    const hasSubmitSpace = /\s/.test(nilai);
    const cleanedValue = hasSubmitSpace ? nilai.split(/\s/)[0] : nilai;
    setInput(cleanedValue);
    setSedangKetik(true);
    if (timerKetik.current) clearTimeout(timerKetik.current);
    timerKetik.current = setTimeout(() => setSedangKetik(false), 500);

    const target = kata[indekKata] || "";
    let benar = ""; let salah = ""; let oke = true;
    for (let i = 0; i < nilai.length; i++) {
      if (oke && i < target.length && nilai[i] === target[i]) benar += nilai[i];
      else { oke = false; salah += nilai[i] ?? ""; }
    }
    setBagianBenar(benar);
    setBagianSalah(salah);
    if (salah.length > 0) setKesalahan((e) => e + 1);
    if (hasSubmitSpace) {
      submitCurrentWord(cleanedValue);
    }
  }, [fase, kata, indekKata, submitCurrentWord]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (fase === "menunggu" || fase === "selesai") {
      if (e.code === "Space" || e.key === " " || e.key === "Spacebar" || e.key === "Enter") { e.preventDefault(); mulaiPermainan(); }
      return;
    }
    if (fase !== "bermain") return;
    if (e.code === "Space" || e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
      e.preventDefault();
      submitCurrentWord();
    }
  }, [fase, submitCurrentWord]);

  const akhiriPermainan = () => {
    setFase((prev) => {
      if (prev === "selesai") return prev;
      setSedangKetik(false);
      if (timerRiwayat.current) clearInterval(timerRiwayat.current);
      
      // Tentukan pemenang
      const winner = posiTali > 50 ? "merah" : posiTali < 50 ? "biru" : null;
      setPemenang(winner);
      
      // Tampilkan score popup
      setShowScorePopup(true);
      
      return "selesai";
    });
  };

  const akhiriPermainanDariSocket = () => {
    setFase((prev) => {
      if (prev === "selesai") return prev;
      setSedangKetik(false);
      if (timerRiwayat.current) clearInterval(timerRiwayat.current);
      
      // Tentukan pemenang
      const winner = posiTali > 50 ? "merah" : posiTali < 50 ? "biru" : null;
      setPemenang(winner);
      
      // Tampilkan score popup
      setShowScorePopup(true);
      return "selesai";
    });
  };

  akhiriPermainanRef.current = akhiriPermainan;
  akhiriPermainanDariSocketRef.current = akhiriPermainanDariSocket;

  const bersihkanData = () => {
    setIndekKata(0); setInput(""); setBagianBenar(""); setBagianSalah("");
    setKataBetul(0); setTotalHuruf(0); setKesalahan(0);
    setWpmPlayer(0); setAkuPlayer(100); setProgresPlayer(0);
    setSedangKetik(false);
    setRematchRequested(false); setRematchReceived(false);
    setLawanKeluar(false); // Reset lawanKeluar state
    if (!isMultiplayer) {
      setProgresBot(0); setWpmBot(0); setAkuBot(92);
    }
    setPosiTali(50); setPemenang(null);
    setWaktuSisa(DURASI);
    
    // Jangan generate kata baru di multiplayer, tunggu dari server
    if (!isMultiplayer) {
      setKata(acakKata());
    }
  };

  const mulaiPermainan = () => {
    bersihkanData();
    setFase("hitung");
    
    // Countdown 3-2-1 dengan jeda 1 detik masing-masing
    setShowCountdownPopup(true);
    setCountdownNumber(3);
    
    setTimeout(() => {
      setCountdownNumber(2);
      setTimeout(() => {
        setCountdownNumber(1);
        setTimeout(() => {
          setShowCountdownPopup(false);
          
          // Tampilkan "FIGHT!" selama 1 detik
          setShowFightPopup(true);
          setTimeout(() => {
            setShowFightPopup(false);
            
            // Mulai game
            setFase("bermain");
            waktuMulai.current = Date.now();
            timerRiwayat.current = setInterval(() => {}, 5000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // Sync ref setiap render agar closure di useEffect selalu fresh
  mulaiPermainanRef.current = mulaiPermainan;

  const resetPermainan = () => {
    bersihkanData();
    setFase("menunggu");
    setLawanKeluar(false);
    setShowScorePopup(false);
    if (timerRiwayat.current) clearInterval(timerRiwayat.current);
  };

  const handleRematchClick = () => {
    if (!isMultiplayer) {
      // Mode bot - reset semua dan langsung mulai
      setShowScorePopup(false);
      bersihkanData();
      mulaiPermainanRef.current();
    } else {
      // Multiplayer mode
      if (rematchReceived) {
        // User menerima tantangan dari lawan
        console.log("✅ Accepting rematch from opponent");
        socket.emit("acceptRematch", { roomCode: kodeRoom });
      } else if (rematchRequested) {
        // User sudah request, klik lagi untuk CANCEL
        console.log("❌ Cancelling rematch request");
        setRematchRequested(false);
        socket.emit("cancelRematch", { roomCode: kodeRoom });
      } else {
        // User mengirim tantangan baru
        console.log("📤 Sending rematch request");
        setRematchRequested(true);
        socket.emit("requestRematch", { roomCode: kodeRoom });
      }
    }
  };

  // Map fase → TugScene prop
  const faseScene = fase === "menunggu" ? "waiting"
    : fase === "hitung" ? "countdown"
    : fase === "bermain" ? "playing"
    : "finished";

  // Phase label for HUD
  const faseLabelHUD =
    fase === "menunggu" ? "TEKAN SPASI UNTUK MULAI" :
    fase === "hitung" ? `BERSIAP — ${hitung}` :
    fase === "bermain" ? "SEDANG BERLANGSUNG" :
    pemenang === "merah" ? "▶ TIM MERAH MENANG!" :
    pemenang === "biru" ? "▶ TIM BIRU MENANG!" :
    "PERTANDINGAN SELESAI";

  const faseLabelColor =
    fase === "bermain" ? "#4A9060" :
    fase === "selesai" && pemenang === "merah" ? "#C84040" :
    fase === "selesai" && pemenang === "biru" ? "#3A70B0" :
    fase === "hitung" ? "#C08030" :
    "#9A8878";

  const namaPlayerDisplay = namaPlayer.toUpperCase().slice(0, 12);

  return (
    <div
      className="game-page-shell"
      style={{
        minHeight: "100svh",
        height: "100vh",
        width: "100%",
        background: "#F0E8D8",
        fontFamily: "'Press Start 2P', monospace",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes blinkPulse { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 
          0%{opacity:0.8; transform:scale(0.95)} 
          50%{opacity:1; transform:scale(1.05)} 
          100%{opacity:1; transform:scale(1)} 
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn { 
          from{opacity:0; transform:scale(0.5) rotate(-5deg)} 
          to{opacity:1; transform:scale(1) rotate(0deg)} 
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #E8DFCC; }
        ::-webkit-scrollbar-thumb { background: #C0B098; }
        @media (max-width: 760px) {
          .game-page-shell {
            height: auto !important;
            min-height: 100svh !important;
            overflow: auto !important;
          }
          .game-header {
            padding: 6px 8px !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
          }
          .game-logo span:first-child {
            font-size: 14px !important;
          }
          .game-logo span:last-child,
          .game-status span {
            font-size: 6px !important;
            letter-spacing: 0.5px !important;
          }
          .game-status {
            order: 3 !important;
            width: 100% !important;
            justify-content: center !important;
            gap: 6px !important;
          }
          .game-header-actions {
            gap: 5px !important;
          }
          .game-header-actions button {
            padding: 8px 7px !important;
            font-size: 7px !important;
          }
          .game-main {
            overflow: visible !important;
          }
          .game-battle-hud {
            grid-template-columns: 1fr !important;
            padding: 6px 8px !important;
            gap: 6px !important;
          }
          .game-team-card {
            min-width: 0 !important;
          }
          .game-team-card > div:first-child,
          .game-team-card > div:last-child {
            width: 34px !important;
            height: 34px !important;
          }
          .game-team-card div {
            min-width: 0 !important;
          }
          .game-team-card [data-player-name] {
            font-size: 7px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          .game-center-hud {
            min-width: 0 !important;
            width: 100% !important;
            order: -1 !important;
          }
          .game-center-hud > div:first-child {
            font-size: 9px !important;
            text-align: center !important;
            line-height: 1.35 !important;
          }
          .game-console-bar,
          .game-footer {
            display: none !important;
          }
          .game-typing-wrap {
            padding: 6px 8px !important;
          }
          .game-scene-wrap {
            min-height: 220px !important;
            height: 40svh !important;
            flex: none !important;
          }
        }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header
        className="game-header"
        style={{
          background: "#E5CBA2",
          borderBottom: "3px solid #8C5A35",
          padding: "4px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 2px 0 #8C5A35",
        }}
      >
        {/* Logo */}
        <button
          className="game-logo"
          onClick={() => navigate("/lobby")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Press Start 2P', monospace", padding: 0,
            display: "flex", flexDirection: "column", gap: "3px",
          }}
        >
          <span style={{ fontSize: "20px", color: "#2A1A18", textShadow: "2px 2px 0 #D8CEB8" }}>
            TYPETUG<span style={{ color: "#C08030" }}>.</span>
          </span>
          <span style={{ fontSize: "6px", color: "#7A6858", letterSpacing: "2px" }}>
            MODE 1 LAWAN 1
          </span>
        </button>

        {/* Status - CENTER */}
        <div className="game-status" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 10, height: 10,
              background: fase === "bermain" ? "#4A9060" : fase === "selesai" ? "#C84040" : "#C08030",
              animation: fase === "bermain" ? "blinkPulse 1.5s ease infinite" : "none",
            }}
          />
          <span style={{ fontSize: "8px", color: "#2A1A18" }}>
            {fase === "menunggu" ? "MENUNGGU PEMAIN"
              : fase === "hitung" ? "BERSIAP..."
              : fase === "bermain" ? "SEDANG BERLANGSUNG"
              : "PERTANDINGAN SELESAI"}
          </span>
          <span style={{ color: "#9A8878", fontSize: "7px", marginLeft: "6px" }}>
            [{kodeRoom}]
          </span>
        </div>

        {/* Buttons */}
        <div className="game-header-actions" style={{ display: "flex", gap: "8px" }}>
          <TombolRetro
            label="▶ MULAI"
            onClick={() => {
              if (fase === "menunggu" || fase === "selesai") {
                if (isMultiplayer) {
                  // Siapa saja yang klik, broadcast ke semua
                  socket.emit("startGame", { roomCode: kodeRoom });
                } else {
                  mulaiPermainan();
                }
              }
            }}
            accent="#4A8858"
            disabled={fase === "hitung" || fase === "bermain"}
          />
          <TombolRetro label="↺ ULANG" onClick={resetPermainan} accent="#6A5878" />
          <TombolRetro label="◀ LOBI" onClick={() => navigate("/lobby")} accent="#C08030" />
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main
        className="game-main"
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden", 
          minHeight: 0,
          filter: (showFightPopup || showScorePopup) ? "blur(4px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── TOP STATS HUD BAR ─────────────────────────────────────────────── */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div
          className="game-battle-hud"
          style={{
            background: "#E5CBA2", // Warna parchment
            borderBottom: "4px solid #8C5A35",
            padding: "8px 16px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "16px",
            flexShrink: 0,
            boxShadow: "0 3px 0 #8C5A3580",
          }}
        >
          {/* ── RED TEAM BLOCK ─────────────────────────────────────────────── */}
          <div
            className="game-team-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "2px solid #8C5A35",
              padding: "4px",
              background: "#D8B488",
              boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.3)",
              borderRadius: "4px",
            }}
          >
            {/* Avatar Placeholder */}
            <div
              style={{
                width: 48,
                height: 48,
                background: "#C84040",
                border: "2px solid #8C5A35",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img src={redTeamLogo} alt="Red Team" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <div data-player-name style={{ color: "#C84040", fontSize: "9px", fontWeight: "bold" }}>◀ {namaPlayer.toUpperCase()}</div>
              <div style={{ color: "#2A1A18", fontSize: "8px" }}>KPM: {wpmPlayer}</div>
              <div style={{ color: "#2A1A18", fontSize: "8px" }}>AKURASI: {akuPlayer}%</div>
              {/* Progress bar */}
              <div style={{ width: "100%", height: "8px", background: "#E5CBA2", border: "1px solid #8C5A35" }}>
                <div style={{ width: `${progresPlayer}%`, height: "100%", background: "#C84040", transition: "width 0.4s ease" }} />
              </div>
            </div>

          </div>

          {/* ── CENTER: TITLE & BATTLE BAR ─────────────────────────────────── */}
          <div
            className="game-center-hud"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              minWidth: "280px",
            }}
          >
            {/* Title */}
            <div
              style={{
                color: "#2A1A18",
                fontSize: "14px",
                textShadow: "1px 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              TYPE TUG - ADU TARIK TAMBANG MENGETIK
            </div>

            {/* Tug-of-war battle bar */}
            <div
              style={{
                width: "100%",
                height: "14px",
                position: "relative",
                border: "2px solid #8C5A35",
                overflow: "hidden",
                background: "#E5CBA2",
                boxShadow: "inset 0 2px 0 rgba(0,0,0,0.1)",
              }}
            >
              {/* Red side */}
              <div style={{ position: "absolute", left: 0, top: 0, width: `${posiTali}%`, height: "100%", background: "linear-gradient(90deg, #901818, #C84040)", transition: "width 0.5s ease" }} />
              {/* Blue side */}
              <div style={{ position: "absolute", right: 0, top: 0, width: `${100 - posiTali}%`, height: "100%", background: "linear-gradient(270deg, #1A3870, #3A70B0)", transition: "width 0.5s ease" }} />
              {/* Center divider */}
              <div style={{ position: "absolute", left: `${posiTali}%`, top: 0, bottom: 0, width: "4px", background: "#C08030", transform: "translateX(-50%)", transition: "left 0.5s ease", zIndex: 2 }} />
            </div>

            {/* Percentages */}
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span style={{ color: "#8C5A35", fontSize: "7px" }}>{Math.round(posiTali)}%</span>
              <span style={{ color: "#8C5A35", fontSize: "7px" }}>KEKUATAN</span>
              <span style={{ color: "#8C5A35", fontSize: "7px" }}>{100 - Math.round(posiTali)}%</span>
            </div>
          </div>

          {/* ── BLUE TEAM BLOCK ────────────────────────────────────────────── */}
          <div
            className="game-team-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "2px solid #8C5A35",
              padding: "4px",
              background: "#D8B488",
              boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.3)",
              borderRadius: "4px",
            }}
          >


            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, alignItems: "flex-end" }}>
              <div data-player-name style={{ color: "#3A70B0", fontSize: "9px", fontWeight: "bold" }}>{isMultiplayer ? (namaMusuh !== "MENUNGGU..." ? namaMusuh.toUpperCase() : "MENUNGGU...") : "BOT"} ▶</div>
              <div style={{ color: "#2A1A18", fontSize: "8px" }}>KPM: {wpmBot}</div>
              <div style={{ color: "#2A1A18", fontSize: "8px" }}>AKURASI: {akuBot}%</div>
              {/* Bot progress bar */}
              <div style={{ width: "100%", height: "8px", background: "#E5CBA2", border: "1px solid #8C5A35", display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: `${Math.round(progresBot)}%`, height: "100%", background: "#3A70B0", transition: "width 0.4s ease" }} />
              </div>
            </div>

            {/* Avatar Placeholder */}
            <div
              style={{
                width: 48,
                height: 48,
                background: "#3A70B0",
                border: "2px solid #8C5A35",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img src={blueTeamLogo} alt="Blue Team" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            </div>
          </div>
        </div>

        {/* ── CONSOLE BAR ────────────────────────────────────────────────────── */}
        <div
          className="game-console-bar"
          style={{
            background: "#E5CBA2",
            borderBottom: "2px solid #8C5A35",
            padding: "4px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }} />
          <span style={{ color: "#9A8878", fontSize: "7px", textAlign: "center" }}>▸ KONSOL PERMAINAN TYPETUG ◂</span>
          <div style={{ flex: 1 }} />
        </div>

        {/* ── TYPING AREA ─────────────────────────────────────────────────────── */}
        <div
          className="game-typing-wrap"
          style={{
            padding: "4px 20px",
            background: "#E5CBA2",
            borderBottom: "2px solid #8C5A35",
            flexShrink: 0,
          }}
        >
          <TypingArea
            words={kata}
            currentWordIndex={indekKata}
            typedCorrect={bagianBenar}
            typedWrong={bagianSalah}
            inputValue={input}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onSubmitWord={submitCurrentWord}
            wpm={wpmPlayer}
            accuracy={akuPlayer}
            timeLeft={waktuSisa}
            gamePhase={faseScene}
            countdown={hitung}
          />
        </div>

        {/* ── TUG SCENE ────────────────────────────────────────────────────────── */}
        <div
          className="game-scene-wrap"
          style={{
            flex: 1,
            overflow: "hidden",
            background: "#F4EDE0",
            minHeight: "180px", // Diturunkan agar tidak memicu scroll
            position: "relative",
          }}
        >
          <TugScene
            ropePosition={posiTali}
            redWPM={wpmPlayer}
            blueWPM={wpmBot}
            gamePhase={faseScene}
            countdown={hitung}
            isMultiplayer={isMultiplayer}
          />
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        className="game-footer"
        style={{
          background: "#F8F2E6",
          borderTop: "2px solid #D8CEB8",
          padding: "5px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#A89878", fontSize: "7px" }}>© TYPETUG ARKADE 2026</span>

        <span style={{ color: "#A89878", fontSize: "7px" }}>SPASI = BERMAIN / KONFIRMASI</span>
      </footer>

      {/* ── COUNTDOWN POPUP (3-2-1) ──────────────────────────────────────────── */}
      {showCountdownPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(42, 26, 24, 0.7)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              fontSize: "120px",
              color: "#C08030",
              textShadow: "8px 8px 0 #8C5A35",
              fontWeight: "bold",
              animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
          >
            {countdownNumber}
          </div>
        </div>
      )}

      {/* ── FIGHT POPUP ────────────────────────────────────────────────────── */}
      {showFightPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(42, 26, 24, 0.7)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #F4EDE0 0%, #E8DFCC 100%)",
              border: "6px solid #C08030",
              boxShadow: "0 0 0 3px #8C5A35, 12px 12px 0 rgba(0,0,0,0.3)",
              padding: "60px 100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative",
            }}
          >
            {/* Decorative corners */}
            {[
              { top: -3, left: -3 }, { top: -3, right: -3 },
              { bottom: -3, left: -3 }, { bottom: -3, right: -3 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 16,
                  height: 16,
                  background: "#C08030",
                  border: "2px solid #8C5A35",
                  ...pos,
                }}
              />
            ))}
            
            <div
              style={{
                fontSize: "clamp(56px, 10vw, 96px)",
                color: "#C84040",
                textShadow: "6px 6px 0 #8C5A35, 3px 3px 0 rgba(0,0,0,0.2)",
                letterSpacing: "12px",
                fontWeight: "bold",
                animation: "shimmer 0.5s ease-in-out",
              }}
            >
              FIGHT!
            </div>
          </div>
        </div>
      )}

      {/* ── SCORE POPUP (FINAL RESULTS) ────────────────────────────────────── */}
      {showScorePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(42, 26, 24, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            animation: "fadeIn 0.3s ease-out",
            overflow: "auto",
          }}
        >
          <div
            style={{
              background: "#F4EDE0",
              border: "6px solid #8C5A35",
              boxShadow: "0 0 0 3px #C08030, 12px 12px 0 rgba(0,0,0,0.3)",
              padding: "32px 40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              maxWidth: "500px",
              position: "relative",
              margin: "20px",
            }}
          >
            {/* Decorative corners */}
            {[
              { top: -3, left: -3 }, { top: -3, right: -3 },
              { bottom: -3, left: -3 }, { bottom: -3, right: -3 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 16,
                  height: 16,
                  background: "#C08030",
                  border: "2px solid #8C5A35",
                  ...pos,
                }}
              />
            ))}

            {/* Title */}
            <div
              style={{
                fontSize: "20px",
                color: "#C08030",
                textShadow: "3px 3px 0 #8C5A35",
                letterSpacing: "2px",
                textAlign: "center",
              }}
            >
              HASIL PERTANDINGAN
            </div>

            {/* Winner Announcement */}
            <div
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #FDF0EE 0%, #EDF3FD 100%)",
                border: "3px solid #C08030",
                padding: "20px",
                textAlign: "center",
              }}
            >
              {(() => {
                const isPlayerWinner = posiTali > 50;
                const isOpponentWinner = posiTali < 50;
                const isDraw = posiTali === 50;
                
                const winnerColor = isPlayerWinner ? "#C84040" : isOpponentWinner ? "#3A70B0" : "#9A8878";
                const winnerName = isPlayerWinner ? namaPlayer.toUpperCase() : 
                                   isOpponentWinner ? (isMultiplayer ? namaMusuh.toUpperCase() : "BOT") : 
                                   null;
                
                return (
                  <>
                    <div style={{ fontSize: "10px", color: "#7A6858", marginBottom: "12px" }}>
                      PEMENANG
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        color: winnerColor,
                        textShadow: "2px 2px 0 rgba(0,0,0,0.2)",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                      }}
                    >
                      {winnerName ? `🏆 ${winnerName} 🏆` : "⚖️ SERI ⚖️"}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Stats Comparison */}
            <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Player Stats */}
              <div style={{ 
                background: "#E8DFCC",
                border: "3px solid #C84040",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "center",
              }}>
                <div style={{ fontSize: "11px", color: "#C84040", fontWeight: "bold", marginBottom: "4px" }}>
                  {namaPlayer.toUpperCase()}
                </div>
                <div style={{ fontSize: "24px", color: "#2A1A18" }}>
                  {wpmPlayer}
                </div>
                <div style={{ fontSize: "8px", color: "#7A6858" }}>
                  KPM
                </div>
                <div style={{ fontSize: "18px", color: "#2A1A18", marginTop: "4px" }}>
                  {akuPlayer}%
                </div>
                <div style={{ fontSize: "8px", color: "#7A6858" }}>
                  AKURASI
                </div>
              </div>
              
              {/* Opponent Stats */}
              <div style={{ 
                background: "#E8DFCC",
                border: "3px solid #3A70B0",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "center",
              }}>
                <div style={{ fontSize: "11px", color: "#3A70B0", fontWeight: "bold", marginBottom: "4px" }}>
                  {isMultiplayer ? namaMusuh.toUpperCase() : "BOT"}
                </div>
                <div style={{ fontSize: "24px", color: "#2A1A18" }}>
                  {wpmBot}
                </div>
                <div style={{ fontSize: "8px", color: "#7A6858" }}>
                  KPM
                </div>
                <div style={{ fontSize: "18px", color: "#2A1A18", marginTop: "4px" }}>
                  {akuBot}%
                </div>
                <div style={{ fontSize: "8px", color: "#7A6858" }}>
                  AKURASI
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "8px" }}>
              {!lawanKeluar && (
                <TombolRetro 
                   label={
                     !isMultiplayer ? "MAIN LAGI" : 
                     rematchReceived ? "TERIMA TANTANGAN" : 
                     rematchRequested ? "BATALKAN" : 
                     "MAIN LAGI"
                   } 
                   onClick={handleRematchClick} 
                   accent={
                     rematchRequested ? "#C84040" : 
                     rematchReceived ? "#4A9060" : 
                     "#4A9060"
                   } 
                   disabled={false}
                />
              )}
              <TombolRetro label="KEMBALI KE LOBI" onClick={() => navigate("/lobby")} accent="#C08030" />
            </div>
          </div>
        </div>
      )}

      {/* ── WIN NOTIFICATION POPUP ────────────────────────────────────────── */}
      {fase === "selesai" && !showScorePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(42, 26, 24, 0.4)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: "#F4EDE0",
              border: "4px solid #8C5A35",
              boxShadow: "8px 8px 0 rgba(0,0,0,0.3)",
              padding: "30px 40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              minWidth: "340px",
            }}
          >
            {lawanKeluar && (
              <div style={{ color: "#C84040", fontSize: "10px", padding: "8px 12px", border: "2px solid #C84040", background: "#FDE8E8", borderRadius: "4px" }}>
                ⚠️ LAWAN KELUAR DARI PERMAINAN!
              </div>
            )}
            {posiTali === 50 ? (
              <div style={{ fontSize: "20px", color: "#A89878", textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                PERTANDINGAN SERI!
              </div>
            ) : (
              <div style={{ fontSize: "20px", color: posiTali > 50 ? "#C84040" : "#3A70B0", textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                {posiTali > 50 ? "TIM MERAH" : "TIM BIRU"} MENANG!
              </div>
            )}

            {/* Scoreboard stats */}
            {posiTali === 50 ? (
               <div style={{ display: "flex", gap: "16px", width: "100%" }}>
                 {/* Tim Merah */}
                 <div style={{ flex: 1, background: "#E8DFCC", padding: "12px", border: "2px solid #C84040", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                   <div style={{ marginBottom: "8px", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #8C5A35", borderRadius: "4px", background: "#D0C4AE" }}>
                     <img src={redTeamLogo} alt="Red Team" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                   </div>
                   <div style={{ fontSize: "8px", color: "#C84040", marginBottom: "8px" }}>TIM MERAH</div>
                   <div style={{ fontSize: "8px", color: "#2A1A18", lineHeight: 1.5, textAlign: "left", width: "100%" }}>
                     WPM: {wpmPlayer}<br/>
                     AKURASI: {akuPlayer}%<br/>
                     BENAR: {kataBetul}<br/>
                     SALAH: {kesalahan}
                   </div>
                 </div>
                 {/* Tim Biru */}
                 <div style={{ flex: 1, background: "#E8DFCC", padding: "12px", border: "2px solid #3A70B0", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                   <div style={{ marginBottom: "8px", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #8C5A35", borderRadius: "4px", background: "#D0C4AE" }}>
                     <img src={blueTeamLogo} alt="Blue Team" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                   </div>
                   <div style={{ fontSize: "8px", color: "#3A70B0", marginBottom: "8px" }}>TIM BIRU</div>
                   <div style={{ fontSize: "8px", color: "#2A1A18", lineHeight: 1.5, textAlign: "left", width: "100%" }}>
                     WPM: {wpmBot}<br/>
                     AKURASI: {akuBot}%<br/>
                     BENAR: {isMultiplayer ? benarBot : Math.max(0, kataBetul + Math.floor(Math.random() * 5) - 2)}<br/>
                     SALAH: {isMultiplayer ? salahBot : kesalahan + Math.floor(Math.random() * 3)}
                   </div>
                 </div>
               </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", background: "#E8DFCC", padding: "16px", border: "2px solid #C8BEA8", borderRadius: "8px" }}>
                <div style={{ marginBottom: "12px", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #8C5A35", borderRadius: "4px", background: "#D0C4AE" }}>
                  <img src={posiTali > 50 ? redTeamLogo : blueTeamLogo} alt="Winner" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px", fontSize: "10px", color: "#2A1A18", width: "100%" }}>
                   <div style={{ textAlign: "right", color: "#7A6858" }}>WPM:</div>
                   <div>{posiTali > 50 ? wpmPlayer : wpmBot}</div>
                   
                   <div style={{ textAlign: "right", color: "#7A6858" }}>AKURASI:</div>
                   <div>{posiTali > 50 ? akuPlayer : akuBot}%</div>
                   
                   <div style={{ textAlign: "right", color: "#7A6858" }}>BENAR:</div>
                   <div>{posiTali > 50 ? kataBetul : (isMultiplayer ? benarBot : Math.max(0, kataBetul + Math.floor(Math.random() * 5) - 2))}</div>
                   
                   <div style={{ textAlign: "right", color: "#7A6858" }}>SALAH:</div>
                   <div>{posiTali > 50 ? kesalahan : (isMultiplayer ? salahBot : kesalahan + Math.floor(Math.random() * 3))}</div>
                </div>
              </div>
            )}
            
            <div style={{ display: "flex", width: "100%", justifyContent: lawanKeluar ? "center" : "space-between", marginTop: "8px" }}>
              {!lawanKeluar && (
                <TombolRetro 
                   label={
                     !isMultiplayer ? "MAIN LAGI" : 
                     rematchReceived ? "TERIMA TANTANGAN" : 
                     rematchRequested ? "BATALKAN" : 
                     "MAIN LAGI"
                   } 
                   onClick={handleRematchClick} 
                   accent={
                     rematchRequested ? "#C84040" : 
                     rematchReceived ? "#4A9060" : 
                     "#4A9060"
                   } 
                   disabled={false}
                />
              )}
              <TombolRetro label="KEMBALI KE LOBI" onClick={() => navigate("/lobby")} accent="#C08030" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TombolRetro({
  label, onClick, accent, disabled,
}: {
  label: string; onClick: () => void; accent: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#E8DFCC" : "#F8F2E6",
        border: `2px solid ${disabled ? "#C8BEA8" : accent}`,
        color: disabled ? "#A89878" : accent,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "8px",
        padding: "8px 14px",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `2px 2px 0 ${accent}40`,
        transition: "all 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = `${accent}15`;
          e.currentTarget.style.transform = "translate(-1px,-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = disabled ? "#E8DFCC" : "#F8F2E6";
        e.currentTarget.style.transform = "none";
      }}
    >
      {label}
    </button>
  );
}
