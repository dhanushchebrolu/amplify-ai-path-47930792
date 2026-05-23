import { useEffect, useRef, useState } from "react";
import type { LearnTask } from "@/data/learnTasks";
import { Sparkles } from "lucide-react";

export function ScratchCard({ task, onReveal, onNext }: { task: LearnTask; onReveal: () => void; onNext: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    // Foil overlay
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#9ca3af");
    g.addColorStop(0.5, "#e5e7eb");
    g.addColorStop(1, "#6b7280");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.font = "600 18px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Scratch to reveal your task", rect.width / 2, rect.height / 2 - 8);
    ctx.font = "400 12px Inter, system-ui";
    ctx.fillText("Drag across the card", rect.width / 2, rect.height / 2 + 14);
  }, [task.id]);

  function pos(e: React.PointerEvent) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function scratch(e: React.PointerEvent) {
    if (!drawing.current || revealed) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
    ctx.fill();
    // sample progress occasionally
    if (Math.random() < 0.1) {
      const c = canvasRef.current!;
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 40) if (data[i] === 0) cleared++;
      const pct = cleared / (data.length / 40);
      setProgress(pct);
      if (pct > 0.45 && !revealed) {
        setRevealed(true);
        onReveal();
      }
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
          style={{ opacity: revealed ? 0 : 1, transition: "opacity 0.4s ease" }}
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drawing.current = true; }}
          onPointerUp={() => { drawing.current = false; }}
          onPointerMove={scratch}
        />
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, progress * 200)}%` }} />
      </div>
      <div className="mt-6 flex gap-3 justify-center">
        <button onClick={onNext} className="px-5 py-2.5 rounded-full border border-white/10 text-sm hover:border-white/25">
          New card
        </button>
        {revealed && (
          <button onClick={onReveal} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Open task
          </button>
        )}
      </div>
    </div>
  );
}
