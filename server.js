import { Server } from "socket.io";
import { createServer } from "http";

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:5173", "http://localhost:5174"];

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // 1. Membuat Room (Host)
  socket.on("createRoom", ({ roomCode, playerName }) => {
    rooms[roomCode] = {
      players: {
        [socket.id]: { name: playerName, role: "host", wpm: 0, accuracy: 100, progress: 0, score: 0 }
      },
      status: "waiting",
    };
    socket.join(roomCode);
    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  // 2. Bergabung ke Room
  socket.on("joinRoom", ({ roomCode, playerName }) => {
    const room = rooms[roomCode];
    if (room) {
      const playerIds = Object.keys(room.players);
      if (playerIds.length >= 2) {
        socket.emit("joinError", "Ruangan sudah penuh!");
        return;
      }

      room.players[socket.id] = { name: playerName, role: "challenger", wpm: 0, accuracy: 100, progress: 0, score: 0 };
      socket.join(roomCode);
      console.log(`${playerName} joined ${roomCode}`);

      // Beritahu semua orang di room bahwa game bisa dimulai
      io.to(roomCode).emit("roomReady", {
        players: room.players
      });
      room.status = "playing";
    } else {
      socket.emit("joinError", "Ruangan tidak ditemukan!");
    }
  });

  // 2a. Start Game Synchronization
  socket.on("startGame", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      const startTime = Date.now();
      room.startTime = startTime;
      room.gameState = "playing";
      
      // Generate kata yang sama untuk kedua pemain
      if (!room.sharedWords) {
        room.sharedWords = generateSharedWords();
      }
      
      // Broadcast ke semua pemain di room untuk mulai bersamaan dengan kata yang sama
      io.to(roomCode).emit("gameStarted", { 
        startTime,
        sharedWords: room.sharedWords 
      });
      console.log(`Game started in room ${roomCode} at ${startTime}`);
    }
  });

  // Helper function untuk generate kata yang sama
  function generateSharedWords() {
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
      // 5 huruf
      "bulan", "dalam", "sudah", "belum", "lebih", "dekat", "duduk", "harap",
      "ingat", "jawab", "kalau", "makin", "milik", "mulai", "nomor", "orang",
      "pakai", "pergi", "pikir", "sakit", "teman", "tidur", "tidak", "tiada",
      "turun", "warna", "yakin", "marah", "sedih", "takut", "benar", "salah",
      "keras", "lemah", "cepat", "bijak", "bodoh", "dapat", "darah", "depan",
    ];
    
    const pool = [...KATA_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 60);
  }

  // 2c. Round Score Stats Synchronization
  socket.on("roundScoreStats", ({ roomCode, round, playerWpm, playerAccuracy, opponentWpm, opponentAccuracy }) => {
    const room = rooms[roomCode];
    if (room) {
      // Broadcast stats ke semua pemain
      socket.to(roomCode).emit("opponentRoundScoreStats", { 
        round, 
        playerWpm, 
        playerAccuracy, 
        opponentWpm, 
        opponentAccuracy 
      });
      console.log(`Round ${round} stats shared in room ${roomCode}`);
    }
  });

  // 2d. Show Round Score Popup Synchronization
  socket.on("showRoundScorePopup", ({ roomCode, round }) => {
    const room = rooms[roomCode];
    if (room) {
      // Broadcast ke semua pemain untuk menampilkan round score popup
      io.to(roomCode).emit("displayRoundScorePopup", { round });
      console.log(`Round ${round} score popup triggered in room ${roomCode}`);
    }
  });

  // 2e. Transition to Next Round Synchronization
  socket.on("transitionToRound", ({ roomCode, nextRound }) => {
    const room = rooms[roomCode];
    if (room) {
      room.currentRound = nextRound;
      room.gameState = "waiting";
      
      // Generate kata baru untuk round berikutnya
      room.sharedWords = generateSharedWords();
      
      // Broadcast ke semua pemain untuk transisi ke round berikutnya
      io.to(roomCode).emit("roundTransition", { 
        nextRound,
        sharedWords: room.sharedWords 
      });
      console.log(`Transitioning to round ${nextRound} in room ${roomCode}`);
    }
  });

  // 2g. Sync Game Time (untuk memastikan timer sinkron)
  socket.on("syncGameTime", ({ roomCode, timeLeft }) => {
    const room = rooms[roomCode];
    if (room) {
      // Broadcast waktu ke semua pemain
      socket.to(roomCode).emit("gameSyncTime", { timeLeft });
    }
  });

  // 2h. Player Finished Round (untuk deteksi siapa yang selesai duluan)
  socket.on("playerFinished", ({ roomCode, round, playerId, stats, playerName }) => {
    const room = rooms[roomCode];
    if (room) {
      if (!room.finishedPlayers) room.finishedPlayers = {};
      if (!room.finishedPlayers[round]) room.finishedPlayers[round] = [];
      
      room.finishedPlayers[round].push({
        playerId,
        playerName,
        stats,
        timestamp: Date.now()
      });
      
      // Broadcast ke semua pemain bahwa ada yang selesai
      io.to(roomCode).emit("opponentFinished", { 
        round, 
        playerId,
        finishedCount: room.finishedPlayers[round].length 
      });
      
      console.log(`Player ${playerName} (${playerId}) finished round ${round} in room ${roomCode}`);
      
      // Jika kedua pemain sudah selesai, tentukan pemenang berdasarkan stats
      if (room.finishedPlayers[round].length === 2) {
        console.log(`Both players finished round ${round} in room ${roomCode}`);
        
        // Tentukan pemenang berdasarkan WPM (atau progress jika WPM sama)
        const player1 = room.finishedPlayers[round][0];
        const player2 = room.finishedPlayers[round][1];
        
        let winnerName = null;
        let winnerPlayerId = null;
        
        // Bandingkan WPM
        if (player1.stats.playerWpm > player2.stats.playerWpm) {
          winnerName = player1.playerName;
          winnerPlayerId = player1.playerId;
        } else if (player2.stats.playerWpm > player1.stats.playerWpm) {
          winnerName = player2.playerName;
          winnerPlayerId = player2.playerId;
        } else {
          // Jika WPM sama, bandingkan accuracy
          if (player1.stats.playerAccuracy > player2.stats.playerAccuracy) {
            winnerName = player1.playerName;
            winnerPlayerId = player1.playerId;
          } else if (player2.stats.playerAccuracy > player1.stats.playerAccuracy) {
            winnerName = player2.playerName;
            winnerPlayerId = player2.playerId;
          }
          // Jika masih sama, null (draw)
        }
        
        // Simpan hasil round di room
        if (!room.roundResults) room.roundResults = {};
        room.roundResults[round] = {
          winnerName,
          winnerPlayerId
        };
        
        console.log(`Round ${round} winner: ${winnerName || 'DRAW'}`);
        
        // Broadcast pemenang ke semua pemain
        io.to(roomCode).emit("roundResult", { 
          round, 
          winnerName,
          winnerPlayerId
        });
        
        io.to(roomCode).emit("bothPlayersFinished", { round });
      }
    }
  });

  // 2f. Show Final Results Synchronization
  socket.on("showFinalResults", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      // Broadcast ke semua pemain untuk menampilkan final results
      io.to(roomCode).emit("displayFinalResults");
      console.log(`Final results triggered in room ${roomCode}`);
    }
  });

  // 3. Update Progres Mengetik
  socket.on("updateProgress", ({ roomCode, wpm, accuracy, progress, score, benar, salah }) => {
    const room = rooms[roomCode];
    if (room && room.players[socket.id]) {
      room.players[socket.id].wpm = wpm;
      room.players[socket.id].accuracy = accuracy;
      room.players[socket.id].progress = progress;
      room.players[socket.id].score = score;
      room.players[socket.id].benar = benar;
      room.players[socket.id].salah = salah;

      // Broadcast progress ke pemain LAWAN
      socket.to(roomCode).emit("opponentProgress", {
        id: socket.id,
        wpm,
        accuracy,
        progress,
        score,
        benar,
        salah
      });
    }
  });

  // 4. Rematch System
  socket.on("requestRematch", ({ roomCode }) => {
    socket.to(roomCode).emit("rematchRequested");
  });

  socket.on("acceptRematch", ({ roomCode }) => {
    io.to(roomCode).emit("rematchAccepted");
  });

  // 5. Game End Synchronization
  socket.on("gameEnded", ({ roomCode }) => {
    socket.to(roomCode).emit("opponentEndedGame");
  });

  // 4. Disconnect Handling
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    for (const roomCode in rooms) {
      if (rooms[roomCode].players[socket.id]) {
        delete rooms[roomCode].players[socket.id];
        // Jika room kosong, hapus room
        if (Object.keys(rooms[roomCode].players).length === 0) {
          delete rooms[roomCode];
        } else {
          // Beritahu lawan bahwa musuh keluar
          io.to(roomCode).emit("opponentLeft");
        }
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server is running on port ${PORT}`);
});
