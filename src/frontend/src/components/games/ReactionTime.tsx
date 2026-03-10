import { Button } from "@/components/ui/button";
import { useCallback, useRef, useState } from "react";

type Phase = "waiting" | "ready" | "go" | "clicked" | "early";

interface ReactionTimeProps {
  onScore: (score: number) => void;
}

export function ReactionTime({ onScore }: ReactionTimeProps) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const start = useCallback(() => {
    setPhase("ready");
    setReactionTime(null);
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setPhase("go");
      startRef.current = Date.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "waiting" || phase === "clicked" || phase === "early") {
      start();
      return;
    }
    if (phase === "ready") {
      clearTimeout(timerRef.current);
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const rt = Date.now() - startRef.current;
      setReactionTime(rt);
      setPhase("clicked");
      setAttempts((prev) => [...prev, rt]);
      const score = Math.max(1000 - rt, 0);
      if (!best || rt < best) {
        setBest(rt);
        onScore(score);
      }
    }
  }, [phase, start, best, onScore]);

  const bgColor =
    phase === "go"
      ? "bg-green-500/30 border-green-400"
      : phase === "early"
        ? "bg-red-500/30 border-red-400"
        : phase === "ready"
          ? "bg-yellow-500/20 border-yellow-400"
          : "bg-navy-mid/50 border-cyan-DEFAULT/30";

  const getMessage = () => {
    if (phase === "waiting") return "Click to Start";
    if (phase === "ready") return "Wait for GREEN...";
    if (phase === "go") return "CLICK NOW!";
    if (phase === "early") return "Too Early! ❌ Click to retry";
    if (phase === "clicked") return `${reactionTime}ms — Click to try again`;
    return "";
  };

  const avg = attempts.length
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-yellow-400">
          Best: {best ? `${best}ms` : "—"}
        </span>
        <span className="text-cyan-DEFAULT">Avg: {avg ? `${avg}ms` : "—"}</span>
        <span className="text-muted-foreground">Tries: {attempts.length}</span>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className={`w-64 h-64 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 font-bold text-xl cursor-pointer select-none ${bgColor}`}
        style={
          phase === "go" ? { boxShadow: "0 0 40px rgba(80,255,80,0.5)" } : {}
        }
        data-ocid="reaction.canvas_target"
      >
        <div className="text-center p-4">
          {phase === "go" ? (
            <p className="text-green-400 text-2xl font-bold glow-cyan-text">
              ⚡ GO!
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">{getMessage()}</p>
          )}
          {reactionTime && phase === "clicked" && (
            <p
              className={`text-4xl font-mono font-bold mt-2 ${reactionTime < 200 ? "text-green-400" : reactionTime < 300 ? "text-cyan-DEFAULT" : "text-yellow-400"}`}
            >
              {reactionTime}ms
            </p>
          )}
        </div>
      </button>
      {attempts.length > 0 && (
        <div className="text-xs font-mono text-muted-foreground">
          Reactions:{" "}
          {attempts.slice(-5).map((t, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: attempt positions are stable
              key={`attempt-${t}-${i}`}
              className={`mr-2 ${t < 200 ? "text-green-400" : t < 300 ? "text-cyan-DEFAULT" : "text-yellow-400"}`}
            >
              {t}ms
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
