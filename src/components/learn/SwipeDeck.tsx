import { useState, useRef } from "react";
import type { LearnTask } from "@/data/learnTasks";
import { ArrowRight, Heart, X, Sparkles } from "lucide-react";

export function SwipeDeck({ tasks, onPick }: { tasks: LearnTask[]; onPick: (t: LearnTask) => void }) {
  const [stack, setStack] = useState(tasks);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const startRef = useRef({ x: 0, y: 0 });

  if (stack.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-10 h-10 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold">You've seen them all!</h3>
        <button onClick={() => setStack(tasks)} className="mt-4 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          Reshuffle
        </button>
      </div>
    );
  }

  const top = stack[0];

  function pointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  }
  function pointerMove(e: React.PointerEvent) {
    if (!drag.active) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y, active: true });
  }
  function pointerUp() {
    const { x } = drag;
    if (Math.abs(x) > 120) {
      const liked = x > 0;
      setStack((s) => s.slice(1));
      if (liked) onPick(top);
    }
    setDrag({ x: 0, y: 0, active: false });
  }

  const rotate = drag.x / 20;
  const likeOpacity = Math.max(0, Math.min(1, drag.x / 120));
  const nopeOpacity = Math.max(0, Math.min(1, -drag.x / 120));

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ height: 520 }}>
      {stack.slice(0, 3).reverse().map((t, idx) => {
        const isTop = idx === stack.slice(0, 3).length - 1;
        const depth = stack.slice(0, 3).length - 1 - idx;
        return (
          <div
            key={t.id}
            onPointerDown={isTop ? pointerDown : undefined}
            onPointerMove={isTop ? pointerMove : undefined}
            onPointerUp={isTop ? pointerUp : undefined}
            className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-card shadow-2xl select-none touch-none"
            style={{
              transform: isTop
                ? `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`
                : `translateY(${depth * 12}px) scale(${1 - depth * 0.04})`,
              transition: drag.active && isTop ? "none" : "transform 0.3s ease",
              zIndex: 10 + idx,
              cursor: isTop ? (drag.active ? "grabbing" : "grab") : "default",
            }}
          >
            <img src={t.cover} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            {isTop && (
              <>
                <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full border-2 border-emerald-400 text-emerald-400 font-bold text-sm rotate-[-12deg]" style={{ opacity: likeOpacity }}>
                  TRY IT
                </div>
                <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full border-2 border-rose-400 text-rose-400 font-bold text-sm rotate-[12deg]" style={{ opacity: nopeOpacity }}>
                  SKIP
                </div>
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 mb-3">
                {t.category} · {t.difficulty} · {t.minutes} min
              </span>
              <h3 className="text-2xl font-semibold leading-tight">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{t.tagline}</p>
              <p className="text-xs text-muted-foreground/80 mt-3">Powered by <span className="text-foreground">{t.tool.name}</span></p>
            </div>
          </div>
        );
      })}

      <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-6">
        <button onClick={() => setStack((s) => s.slice(1))} className="w-14 h-14 rounded-full border border-white/10 bg-card grid place-items-center hover:border-rose-400 hover:text-rose-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <button onClick={() => { setStack((s) => s.slice(1)); onPick(top); }} className="w-14 h-14 rounded-full bg-primary text-primary-foreground grid place-items-center hover:scale-105 transition-transform">
          <Heart className="w-5 h-5 fill-current" />
        </button>
        <button onClick={() => { setStack((s) => s.slice(1)); onPick(top); }} className="w-14 h-14 rounded-full border border-white/10 bg-card grid place-items-center hover:border-primary hover:text-primary transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
