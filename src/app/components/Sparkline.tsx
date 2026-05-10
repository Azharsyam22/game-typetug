import { useEffect, useRef } from "react";

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color, width = 120, height = 32 }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#F0E8D8";
    ctx.fillRect(0, 0, width, height);

    // Grid lines (very faint, pixel style)
    ctx.fillStyle = "#E4D8C4";
    for (let x = 0; x < width; x += 8) {
      ctx.fillRect(x, 0, 1, height);
    }
    for (let y = 0; y < height; y += 8) {
      ctx.fillRect(0, y, width, 1);
    }

    if (data.length < 2) {
      // Placeholder dots
      ctx.fillStyle = color + "60";
      for (let i = 0; i < 10; i++) {
        ctx.fillRect(i * 12 + 4, height / 2 + Math.sin(i) * 4, 2, 2);
      }
      return;
    }

    const maxVal = Math.max(...data, 1);
    const minVal = Math.min(...data, 0);
    const range = maxVal - minVal || 1;
    const pad = 4;

    const toX = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
    const toY = (v: number) => height - pad - ((v - minVal) / range) * (height - pad * 2);

    // Area fill
    ctx.fillStyle = color + "22";
    ctx.beginPath();
    ctx.moveTo(toX(0), height - pad);
    data.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(data.length - 1), height - pad);
    ctx.closePath();
    ctx.fill();

    // Pixel-line (step-rendered, 2px wide blocks)
    const segW = Math.max(2, Math.floor((width - pad * 2) / (data.length - 1)));
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = Math.round(toX(i));
      const y1 = Math.round(toY(data[i]));
      const x2 = Math.round(toX(i + 1));
      const y2 = Math.round(toY(data[i + 1]));

      // Step from y1 to y2 along x
      const steps = Math.abs(x2 - x1) / 2;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = Math.round(x1 + (x2 - x1) * t);
        const py = Math.round(y1 + (y2 - y1) * t);
        ctx.fillStyle = color;
        ctx.fillRect(px, py, 2, 2);
      }
    }

    // Data point dots
    data.forEach((v, i) => {
      ctx.fillStyle = "#F4EDE0";
      ctx.fillRect(Math.round(toX(i)) - 1, Math.round(toY(v)) - 1, 4, 4);
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(toX(i)), Math.round(toY(v)), 2, 2);
    });

    // Border
    ctx.strokeStyle = "#D4C8B0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }, [data, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ imageRendering: "pixelated", display: "block" }}
    />
  );
}
