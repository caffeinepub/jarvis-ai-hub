import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";

interface NumberGuessProps {
  onScore: (score: number) => void;
}

export function NumberGuess({ onScore }: NumberGuessProps) {
  const [target] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(target);

  const handleGuess = useCallback(() => {
    const num = Number.parseInt(guess);
    if (Number.isNaN(num) || num < 1 || num > 100) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuess("");

    if (num === currentTarget) {
      setWon(true);
      const score = Math.max(100 - newAttempts * 10, 10);
      onScore(score);
      setHints((prev) => [
        ...prev,
        `🎉 Correct! The number was ${currentTarget}! (${newAttempts} attempts)`,
      ]);
    } else {
      const diff = Math.abs(num - currentTarget);
      let hint = num < currentTarget ? "📈 Too low!" : "📉 Too high!";
      if (diff <= 5) hint += " Very close!";
      else if (diff <= 15) hint += " Getting warmer...";
      else hint += " Way off!";
      setHints((prev) => [...prev, `Guess ${newAttempts}: ${num} — ${hint}`]);
    }
  }, [guess, attempts, currentTarget, onScore]);

  const reset = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1;
    setCurrentTarget(newTarget);
    setGuess("");
    setAttempts(0);
    setHints([]);
    setWon(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div className="p-4 rounded-lg glow-border text-center">
        <p className="text-muted-foreground text-sm">
          Guess the number between 1-100
        </p>
        <p className="text-cyan-DEFAULT font-mono font-bold">
          Attempts: {attempts}
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          min={1}
          max={100}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !won && handleGuess()}
          disabled={won}
          placeholder="Enter 1-100"
          className="bg-navy-mid/50 border-cyan-DEFAULT/30 focus:border-cyan-DEFAULT/60 text-foreground"
          data-ocid="numguess.input"
        />
        <Button
          onClick={handleGuess}
          disabled={won || !guess}
          className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
          data-ocid="numguess.submit_button"
        >
          Guess
        </Button>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {hints.map((h) => (
          <p
            key={h}
            className={`text-xs font-mono p-2 rounded ${h.includes("Correct") ? "text-green-400 bg-green-400/10" : "text-muted-foreground bg-navy-mid/30"}`}
          >
            {h}
          </p>
        ))}
      </div>
      {won && (
        <Button
          onClick={reset}
          className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
          data-ocid="numguess.button"
        >
          Play Again
        </Button>
      )}
    </div>
  );
}
