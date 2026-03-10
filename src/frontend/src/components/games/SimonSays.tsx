import { Button } from "@/components/ui/button";
import { useCallback, useRef, useState } from "react";

const COLORS = ["red", "green", "blue", "yellow"] as const;
type Color = (typeof COLORS)[number];
const COLOR_STYLES: Record<
  Color,
  { bg: string; active: string; glow: string }
> = {
  red: {
    bg: "bg-red-900/40 border-red-500/40",
    active: "bg-red-400 border-red-400 scale-110",
    glow: "shadow-[0_0_20px_rgba(255,80,80,0.8)]",
  },
  green: {
    bg: "bg-green-900/40 border-green-500/40",
    active: "bg-green-400 border-green-400 scale-110",
    glow: "shadow-[0_0_20px_rgba(80,255,80,0.8)]",
  },
  blue: {
    bg: "bg-blue-900/40 border-blue-500/40",
    active: "bg-blue-400 border-blue-400 scale-110",
    glow: "shadow-[0_0_20px_rgba(80,130,255,0.8)]",
  },
  yellow: {
    bg: "bg-yellow-900/40 border-yellow-500/40",
    active: "bg-yellow-400 border-yellow-400 scale-110",
    glow: "shadow-[0_0_20px_rgba(255,220,80,0.8)]",
  },
};

interface SimonSaysProps {
  onScore: (score: number) => void;
}

export function SimonSays({ onScore }: SimonSaysProps) {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerSeq, setPlayerSeq] = useState<Color[]>([]);
  const [active, setActive] = useState<Color | null>(null);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "lost">(
    "idle",
  );
  const [level, setLevel] = useState(0);
  const playingRef = useRef(false);

  const playSequence = useCallback(async (seq: Color[]) => {
    playingRef.current = true;
    setPhase("showing");
    await new Promise((r) => setTimeout(r, 500));
    for (const color of seq) {
      setActive(color);
      await new Promise((r) => setTimeout(r, 600));
      setActive(null);
      await new Promise((r) => setTimeout(r, 300));
    }
    playingRef.current = false;
    setPhase("input");
  }, []);

  const startGame = useCallback(() => {
    const first = COLORS[Math.floor(Math.random() * 4)];
    const seq = [first];
    setSequence(seq);
    setPlayerSeq([]);
    setLevel(1);
    void playSequence(seq);
  }, [playSequence]);

  const handlePress = useCallback(
    (color: Color) => {
      if (phase !== "input") return;
      const newPlayer = [...playerSeq, color];
      setPlayerSeq(newPlayer);
      setActive(color);
      setTimeout(() => setActive(null), 200);

      if (newPlayer[newPlayer.length - 1] !== sequence[newPlayer.length - 1]) {
        setPhase("lost");
        onScore(level * 10);
        return;
      }

      if (newPlayer.length === sequence.length) {
        const newSeq = [...sequence, COLORS[Math.floor(Math.random() * 4)]];
        setSequence(newSeq);
        setPlayerSeq([]);
        setLevel((l) => l + 1);
        setTimeout(() => void playSequence(newSeq), 800);
      }
    },
    [phase, playerSeq, sequence, level, onScore, playSequence],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-cyan-DEFAULT">Level: {level}</span>
        <span className="text-muted-foreground">
          {phase === "showing"
            ? "Watch..."
            : phase === "input"
              ? "Your turn!"
              : phase === "lost"
                ? "Wrong! 💀"
                : "Ready"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {COLORS.map((color, idx) => (
          <button
            key={color}
            type="button"
            onClick={() => handlePress(color)}
            disabled={phase !== "input"}
            className={`w-28 h-28 rounded-2xl border-2 text-2xl font-bold transition-all duration-150 ${
              active === color
                ? `${COLOR_STYLES[color].active} ${COLOR_STYLES[color].glow}`
                : COLOR_STYLES[color].bg
            } ${phase !== "input" ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            data-ocid={`simon.item.${idx + 1}`}
          >
            {color === "red"
              ? "🔴"
              : color === "green"
                ? "🟢"
                : color === "blue"
                  ? "🔵"
                  : "🟡"}
          </button>
        ))}
      </div>
      {(phase === "idle" || phase === "lost") && (
        <Button
          onClick={startGame}
          className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
          data-ocid="simon.button"
        >
          {phase === "lost" ? "Try Again" : "Start Game"}
        </Button>
      )}
    </div>
  );
}
