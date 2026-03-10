import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

interface WhackMoleProps {
  onScore: (score: number) => void;
}

const HOLES = 9;
const GAME_DURATION = 30;

export function WhackMole({ onScore }: WhackMoleProps) {
  const [moles, setMoles] = useState<boolean[]>(Array(HOLES).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const moleRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const scoreRef = useRef(0);

  const stopGame = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(moleRef.current);
    setRunning(false);
    setGameOver(true);
    setMoles(Array(HOLES).fill(false));
    onScore(scoreRef.current);
  }, [onScore]);

  const startGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_DURATION);
    setRunning(true);
    setGameOver(false);
    setMoles(Array(HOLES).fill(false));

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const popMole = () => {
      const idx = Math.floor(Math.random() * HOLES);
      setMoles((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
      setTimeout(() => {
        setMoles((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
      }, 700);
    };

    popMole();
    moleRef.current = setInterval(popMole, 800);
  }, [stopGame]);

  const whack = useCallback(
    (i: number) => {
      if (!moles[i] || !running) return;
      setMoles((prev) => {
        const n = [...prev];
        n[i] = false;
        return n;
      });
      setScore((s) => {
        const ns = s + 10;
        scoreRef.current = ns;
        return ns;
      });
    },
    [moles, running],
  );

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearInterval(moleRef.current);
    },
    [],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm font-mono">
        <span className="text-cyan-DEFAULT">Score: {score}</span>
        <span className={timeLeft <= 10 ? "text-red-400" : "text-green-400"}>
          Time: {timeLeft}s
        </span>
      </div>
      {gameOver && (
        <p className="text-yellow-400 font-bold">Final Score: {score} 🎯</p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {moles.map((active, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: mole hole positions are stable
            key={`mole-${i}`}
            type="button"
            onClick={() => whack(i)}
            className={`w-24 h-24 rounded-full border-2 text-4xl transition-all duration-100 ${
              active
                ? "border-yellow-400/80 bg-yellow-400/20 scale-110 cursor-pointer shadow-lg"
                : "border-cyan-DEFAULT/20 bg-navy-mid/50 cursor-default"
            }`}
            style={active ? { boxShadow: "0 0 20px rgba(250,204,21,0.5)" } : {}}
            data-ocid={`whack.item.${i + 1}`}
          >
            {active ? "🦔" : "⚫"}
          </button>
        ))}
      </div>
      {!running && (
        <Button
          onClick={startGame}
          className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
          data-ocid="whack.button"
        >
          {gameOver ? "Play Again" : "Start Game"}
        </Button>
      )}
    </div>
  );
}
