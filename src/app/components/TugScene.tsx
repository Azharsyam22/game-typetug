import { useEffect, useRef } from "react";

interface TugSceneProps {
  ropePosition: number; // 0-100, >50 = red winning
  redWPM: number;
  blueWPM: number;
  gamePhase: "waiting" | "countdown" | "playing" | "finished";
  countdown: number;
  isMultiplayer: boolean;
}

// ── Load Custom PNG Fighter & Background ──────────────────────────────────────
const fighterImgMulti = new Image();
fighterImgMulti.src = new URL('../../assets/image/tug-fighter.png', import.meta.url).href;

const bgImgMulti = new Image();
bgImgMulti.src = new URL('../../assets/image/background-gameplay.png', import.meta.url).href;

const fighterImgBot = new Image();
fighterImgBot.src = new URL('../../assets/image/tug-fighter.png', import.meta.url).href;

const bgImgBot = new Image();
bgImgBot.src = new URL('../../assets/image/background-gameplay-bot.png', import.meta.url).href;

// ── TugScene component ─────────────────────────────────────────────────────────
export function TugScene({ ropePosition, gamePhase, countdown, isMultiplayer }: TugSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);
  const smoothShiftRef = useRef(0); // Referensi untuk animasi pergeseran yang mulus

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const activeBgImg = bgImgMulti;
    const activeFighterImg = isMultiplayer ? fighterImgMulti : fighterImgBot;

    const W = canvas.width;
    const H = canvas.height;
    const groundY = 200;              

    function draw(frame: number, ctx: CanvasRenderingContext2D) {
      ctx.clearRect(0, 0, W, H);
      
      // Mencegah pixel art jadi buram saat diperbesar
      ctx.imageSmoothingEnabled = false; 

      // ── BACKGROUND ──────────────────────────────────────────────────────
      const isMobileViewport = typeof window !== "undefined" && window.innerWidth <= 760;

      if (activeBgImg.complete && activeBgImg.naturalWidth > 0) {
        if (isMobileViewport) {
          const bgRatio = activeBgImg.naturalWidth / activeBgImg.naturalHeight;
          const canvasRatio = W / H;
          let sourceWidth = activeBgImg.naturalWidth;
          let sourceHeight = activeBgImg.naturalHeight;
          let sourceX = 0;
          let sourceY = 0;

          if (bgRatio > canvasRatio) {
            sourceWidth = sourceHeight * canvasRatio;
            sourceX = (activeBgImg.naturalWidth - sourceWidth) / 2;
          } else {
            sourceHeight = sourceWidth / canvasRatio;
            sourceY = Math.max(0, activeBgImg.naturalHeight - sourceHeight);
          }

          ctx.drawImage(activeBgImg, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, W, H);
        } else {
          ctx.drawImage(activeBgImg, 0, 0, W, H);
        }
      } else {
        // Warna fallback jika gambar belum termuat
        ctx.fillStyle = "#F4EDE0";
        ctx.fillRect(0, 0, W, H);
      }

      // ── TUG FIGHTERS IMAGE (Tengah Layar) ───────────────────────────────
      // Lean: -0.5 (Biru menang penuh) hingga 0.5 (Merah menang penuh)
      const lean = (ropePosition - 50) / 100; 
      
      // Jika ropePosition > 50 (merah menang), gambar bergeser ke kiri (negatif)
      // Jika ropePosition < 50 (biru menang), gambar bergeser ke kanan (positif)
      const maxShift = isMobileViewport ? 260 : 420; 
      const targetShiftX = lean * -maxShift;

      // Membuat gerakan terseret perlahan (Smooth Lerp)
      smoothShiftRef.current += (targetShiftX - smoothShiftRef.current) * 0.04;
      const shiftX = smoothShiftRef.current;

      // ── DUST at fighter feet ─────────────────────────────────────────────
      // Bendera emas di gambar tidak persis di tengah, jadi kita geser semuanya sedikit ke kiri
      const centerOffsetX = -32; 

      // Gambar debu bergerak mengikuti pergeseran pemain
      for (let i = 0; i < 6; i++) {
        const dw = 30 - i * 3;
        const dx1 = W / 2 - 210 + shiftX + centerOffsetX + Math.sin(frame * 0.08 + i * 1.2) * 5;
        const dx2 = W / 2 + 210 + shiftX + centerOffsetX + Math.sin(frame * 0.1 + i * 1.5) * 5;
        
        // Debu diletakkan tepat di area jalan tanah (sekitar Y=210)
        const dy = 208 + i * 3; 
        ctx.fillStyle = `rgba(180,162,130,${0.25 - i * 0.03})`;
        ctx.fillRect(dx1, dy, dw, 5);
        ctx.fillRect(dx2, dy, dw, 5);
      }

      // Mobile memakai crop supaya area kosong transparan di atas tidak mengecilkan karakter.
      // Desktop dipertahankan seperti framing awal.
      if (activeFighterImg.complete && activeFighterImg.naturalWidth > 0) {
        if (isMobileViewport) {
          const cropY = 330;
          const cropHeight = activeFighterImg.naturalHeight - cropY;
          const desiredWidth = 900;
          const ratio = activeFighterImg.naturalWidth / cropHeight;
          const desiredHeight = desiredWidth / ratio;
          const cx = W / 2 + shiftX + centerOffsetX;
          const cy = H - 4; 

          ctx.drawImage(
            activeFighterImg,
            0,
            cropY,
            activeFighterImg.naturalWidth,
            cropHeight,
            cx - desiredWidth / 2,
            cy - desiredHeight,
            desiredWidth,
            desiredHeight
          );
        } else {
          const desiredWidth = 640;
          const ratio = activeFighterImg.naturalWidth / activeFighterImg.naturalHeight;
          const desiredHeight = desiredWidth / ratio;
          const cx = W / 2 + shiftX + centerOffsetX;
          const cy = groundY; 

          ctx.drawImage(
            activeFighterImg,
            cx - desiredWidth / 2,
            cy - desiredHeight + 15,
            desiredWidth,
            desiredHeight
          );
        }
      }

      // ── CANVAS OVERLAYS (Minimalis) ──────────────────────────────────────
      const beltY = groundY - 80;
      ctx.textAlign = "center";

      // Tidak ada canvas overlay untuk countdown lagi, akan dipindahkan ke DOM (HTML/CSS)
    }

    const animate = () => {
      frameRef.current++;
      draw(frameRef.current, ctx);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [ropePosition, gamePhase, countdown, isMultiplayer]);

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={240}
      style={{
        imageRendering: "pixelated",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "bottom",
        position: "absolute",
        top: 0,
        left: 0,
        display: "block",
      }}
    />
  );
}
