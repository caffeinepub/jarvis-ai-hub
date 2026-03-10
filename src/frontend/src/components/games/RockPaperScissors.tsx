import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

type Choice = "rock" | "paper" | "scissors";
const CHOICES: Choice[] = ["rock", "paper", "scissors"];
const EMOJI: Record<Choice, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

function getResult(player: Choice, ai: Choice): "win" | "lose" | "draw" {
  if (player === ai) return "draw";
  if (
    (player === "rock" && ai === "scissors") ||
    (player === "paper" && ai === "rock") ||
    (player === "scissors" && ai === "paper")
  )
    return "win";
  return "lose";
}

interface RPSProps {
  onScore: (score: number) => void;
}

export function RockPaperScissors({ onScore }: RPSProps) {
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [lastResult, setLastResult] = useState<{
    player: Choice;
    ai: Choice;
    result: string;
  } | null>(null);

  const play = useCallback(
    (choice: Choice) => {
      const ai = CHOICES[Math.floor(Math.random() * 3)];
      const result = getResult(choice, ai);
      const resultText =
        result === "win"
          ? "You Win! 🎉"
          : result === "lose"
            ? "JARVIS Wins! 🤖"
            : "Draw! 🤝";
      setLastResult({ player: choice, ai, result: resultText });
      if (result === "win") {
        const newWins = wins + 1;
        setWins(newWins);
        onScore(newWins * 5);
      }
      if (result === "lose") setLosses((l) => l + 1);
      if (result === "draw") setDraws((d) => d + 1);
    },
    [wins, onScore],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6 text-sm font-mono">
        <span className="text-green-400">Wins: {wins}</span>
        <span className="text-red-400">Losses: {losses}</span>
        <span className="text-yellow-400">Draws: {draws}</span>
      </div>
      {lastResult && (
        <div className="p-4 rounded-lg glow-border text-center">
          <div className="flex items-center justify-center gap-6 text-5xl mb-2">
            <span>{EMOJI[lastResult.player]}</span>
            <span className="text-muted-foreground text-lg">vs</span>
            <span>{EMOJI[lastResult.ai]}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">You vs JARVIS</p>
          <p
            className={`font-bold text-lg ${lastResult.result.includes("Win!") && !lastResult.result.includes("JARVIS") ? "text-green-400" : lastResult.result.includes("JARVIS") ? "text-red-400" : "text-yellow-400"}`}
          >
            {lastResult.result}
          </p>
        </div>
      )}
      <div className="flex gap-4">
        {CHOICES.map((c, idx) => (
          <button
            key={c}
            type="button"
            onClick={() => play(c)}
            className="w-20 h-20 text-4xl rounded-xl border border-cyan-DEFAULT/30 bg-navy-mid hover:bg-cyan-DEFAULT/10 hover:border-cyan-DEFAULT/60 hover:scale-110 transition-all duration-200"
            data-ocid={`rps.item.${idx + 1}`}
          >
            {EMOJI[c]}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Click to play</p>
    </div>
  );
}
