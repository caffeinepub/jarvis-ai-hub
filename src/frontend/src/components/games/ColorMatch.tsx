import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

type Color = { name: string; hex: string };
const COLORS: Color[] = [
  { name: "Red", hex: "#ff4444" },
  { name: "Blue", hex: "#4488ff" },
  { name: "Green", hex: "#44cc44" },
  { name: "Yellow", hex: "#ffcc00" },
  { name: "Purple", hex: "#aa44ff" },
  { name: "Orange", hex: "#ff8800" },
  { name: "Cyan", hex: "#00ddff" },
  { name: "Pink", hex: "#ff44aa" },
];

function getRandom(): {
  displayColor: Color;
  textName: string;
  match: boolean;
} {
  const displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  const match = Math.random() > 0.5;
  return {
    displayColor,
    textName: match
      ? displayColor.name
      : textColor.name === displayColor.name
        ? COLORS[(COLORS.indexOf(textColor) + 1) % COLORS.length].name
        : textColor.name,
    match,
  };
}

interface ColorMatchProps {
  onScore: (score: number) => void;
}

export function ColorMatch({ onScore }: ColorMatchProps) {
  const [current, setCurrent] = useState(getRandom);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [total, setTotal] = useState(0);
  const [_speed, _setSpeed] = useState<number[]>([]);
  const [_startTime] = useState(Date.now);

  const answer = useCallback(
    (isMatch: boolean) => {
      const correct = isMatch === current.match;
      const newStreak = correct ? streak + 1 : 0;
      const newScore = correct
        ? score + 10 + newStreak * 2
        : Math.max(score - 5, 0);
      setFeedback(correct ? "correct" : "wrong");
      setStreak(newStreak);
      setScore(newScore);
      setTotal((t) => t + 1);
      onScore(newScore);
      setTimeout(() => {
        setCurrent(getRandom());
        setFeedback(null);
      }, 300);
    },
    [current.match, streak, score, onScore],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-cyan-DEFAULT">Score: {score}</span>
        <span className="text-yellow-400">Streak: {streak}🔥</span>
        <span className="text-muted-foreground">{total} played</span>
      </div>
      <div
        className={`p-8 rounded-2xl glow-border flex flex-col items-center gap-4 transition-all duration-200 ${
          feedback === "correct"
            ? "border-green-400/60 bg-green-400/10"
            : feedback === "wrong"
              ? "border-red-400/60 bg-red-400/10"
              : ""
        }`}
      >
        <p className="text-sm text-muted-foreground">
          Does the COLOR match the TEXT?
        </p>
        <p
          className="text-5xl font-bold"
          style={{
            color: current.displayColor.hex,
            textShadow: `0 0 20px ${current.displayColor.hex}`,
          }}
        >
          {current.textName}
        </p>
        <p className="text-xs text-muted-foreground">
          Displayed in: {current.displayColor.name}
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => answer(true)}
          className="px-8 py-6 text-lg bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30"
          data-ocid="colormatch.primary_button"
        >
          ✅ Match
        </Button>
        <Button
          onClick={() => answer(false)}
          className="px-8 py-6 text-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
          data-ocid="colormatch.secondary_button"
        >
          ❌ No Match
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Answer as fast as possible! +streak bonus 🔥
      </p>
    </div>
  );
}
