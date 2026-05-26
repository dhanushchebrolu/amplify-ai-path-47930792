import { useEffect, useRef, useState } from "react";
import type { LearnTask } from "@/data/learnTasks";
import { Sparkles } from "lucide-react";

// Real scratch sample — loops while user is scratching.
function useScratchSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  function ensure() {
    if (!audioRef.current) {
      const a = new Audio("/sounds/scratch.mp3");
      a.loop = true;
      a.volume = 0.6;
      audioRef.current = a;
    }
    return audioRef.current;
  }
  function start() {
    const a = ensure();
    if (playingRef.current) return;
    playingRef.current = true;
    a.currentTime = 0;
    a.play().catch(() => {});
  }
  function stop() {
    if (!playingRef.current) return;
    playingRef.current = false;
    const a = audioRef.current;
    if (a) { a.pause(); a.currentTime = 0; }
  }
  return { start, stop };
}

const ERASE_W = 70;
const ERASE_H = 32;

export function ScratchCard({ task, onReveal, onNext }: { task: LearnTask; onReveal: () => void; onNext: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const scratchSound = useScratchSound();

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    // Solid opaque foil — stronger coverage so nothing leaks through
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#6b7280");
    g.addColorStop(0.45, "#cbd5e1");
    g.addColorStop(0.55, "#e5e7eb");
    g.addColorStop(1, "#475569");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    // Subtle diagonal hatch to mimic foil grain
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = -rect.height; i < rect.width; i += 6) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + rect.height, rect.height); ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = "700 20px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL", rect.width / 2, rect.height / 2 - 8);
    ctx.font = "400 12px Inter, system-ui";
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillText("drag across like an eraser", rect.width / 2, rect.height / 2 + 14);
  }, [task.id]);

  function pos(e: React.PointerEvent) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function eraseAt(p: { x: number; y: number }) {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    // Eraser-shaped rectangle (with slight rounding)
    const x = p.x - ERASE_W / 2;
    const y = p.y - ERASE_H / 2;
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + ERASE_W - r, y);
    ctx.quadraticCurveTo(x + ERASE_W, y, x + ERASE_W, y + r);
    ctx.lineTo(x + ERASE_W, y + ERASE_H - r);
    ctx.quadraticCurveTo(x + ERASE_W, y + ERASE_H, x + ERASE_W - r, y + ERASE_H);
    ctx.lineTo(x + r, y + ERASE_H);
    ctx.quadraticCurveTo(x, y + ERASE_H, x, y + ERASE_H - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function scratch(e: React.PointerEvent) {
    if (!drawing.current || revealed) return;
    const p = pos(e);
    // Interpolate from last point to avoid gaps when moving fast
    const last = lastPt.current ?? p;
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 12));
    for (let i = 1; i <= steps; i++) {
      eraseAt({ x: last.x + (dx * i) / steps, y: last.y + (dy * i) / steps });
    }
    lastPt.current = p;
    playScratch();

    if (Math.random() < 0.08) {
      const c = canvasRef.current!;
      const ctx = c.getContext("2d")!;
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 40) if (data[i] === 0) cleared++;
      const pct = cleared / (data.length / 40);
      setProgress(pct);
      if (pct > 0.5 && !revealed) { setRevealed(true); onReveal(); }
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 bg-card shadow-2xl">
        <img src={task.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 mb-2">
            {task.category} · {task.difficulty}
          </span>
          <h3 className="text-2xl font-semibold leading-tight">{task.title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5">{task.tagline}</p>
          <p className="text-xs text-muted-foreground/80 mt-2">Tool: <span className="text-foreground">{task.tool.name}</span></p>
        </div>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ opacity: revealed ? 0 : 1, transition: "opacity 0.4s ease", cursor: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='24'><rect x='1' y='1' width='38' height='22' rx='4' fill='%23f5e9c8' stroke='%23000' stroke-width='1.5'/></svg>\") 20 12, crosshair" }}
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drawing.current = true; lastPt.current = pos(e); eraseAt(lastPt.current); playScratch(); }}
          onPointerUp={() => { drawing.current = false; lastPt.current = null; }}
          onPointerLeave={() => { drawing.current = false; lastPt.current = null; }}
          onPointerMove={scratch}
        />
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, progress * 200)}%` }} />
      </div>
      <div className="mt-6 flex gap-3 justify-center flex-wrap">
        <button onClick={onNext} className="px-5 py-2.5 rounded-full border border-white/10 text-sm hover:border-white/25">
          New card
        </button>
        {!revealed && (
          <button
            onClick={() => {
              const c = canvasRef.current; if (c) c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
              setRevealed(true);
            }}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium"
          >
            Reveal now
          </button>
        )}
        {revealed && (
          <button onClick={onReveal} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Start task
          </button>
        )}
      </div>
    </div>
  );
}
