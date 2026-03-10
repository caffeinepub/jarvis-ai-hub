import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy } from "lucide-react";
import { useCallback, useState } from "react";

type Square = "X" | "O" | null;

function minimax(squares: Square[], isMaximizing: boolean): number {
  const winner = checkWinner(squares);
  if (winner === "O") return 10;
  if (winner === "X") return -10;
  if (squares.every(Boolean)) return 0;

  if (isMaximizing) {
    let best = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = "O";
        best = Math.max(best, minimax(squares, false));
        squares[i] = null;
      }
    }
    return best;
  }
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      squares[i] = "X";
      best = Math.min(best, minimax(squares, true));
      squares[i] = null;
    }
  }
  return best;
}

function getBestMove(squares: Square[]): number {
  let bestVal = Number.NEGATIVE_INFINITY;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      squares[i] = "O";
      const moveVal = minimax(squares, false);
      squares[i] = null;
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function checkWinner(squares: Square[]): Square {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

interface TicTacToeProps {
  onScore: (score: number) => void;
}

export function TicTacToe({ onScore }: TicTacToeProps) {
  const [squares, setSquares] = useState<Square[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost" | "draw">(
    "playing",
  );
  const [reported, setReported] = useState(false);

  const handleClick = useCallback(
    (i: number) => {
      if (squares[i] || status !== "playing") return;
      const next = [...squares];
      next[i] = "X";

      const winAfterPlayer = checkWinner(next);
      if (winAfterPlayer) {
        setSquares(next);
        setStatus("won");
        const newWins = wins + 1;
        setWins(newWins);
        if (!reported) {
          onScore(newWins * 10);
          setReported(true);
        }
        return;
      }
      if (next.every(Boolean)) {
        setSquares(next);
        setStatus("draw");
        return;
      }

      // AI move
      const aiMove = getBestMove([...next]);
      if (aiMove >= 0) next[aiMove] = "O";
      setSquares([...next]);
      setXIsNext(true);

      const winAfterAI = checkWinner(next);
      if (winAfterAI) {
        setStatus("lost");
        setLosses(losses + 1);
      } else if (next.every(Boolean)) {
        setStatus("draw");
      }
    },
    [squares, status, wins, losses, onScore, reported],
  );

  const reset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setStatus("playing");
    setReported(false);
  };

  const winner = checkWinner(squares);
  const statusText = winner
    ? winner === "X"
      ? "You Win! 🎉"
      : "JARVIS Wins! 🤖"
    : squares.every(Boolean)
      ? "Draw! 🤝"
      : `Your turn (${xIsNext ? "X" : "..."})`;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-6 text-sm font-mono">
        <span className="text-green-400">You (X): {wins}</span>
        <span className="text-red-400">JARVIS (O): {losses}</span>
      </div>
      <p className="text-cyan-DEFAULT font-display font-semibold glow-cyan-text">
        {statusText}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {squares.map((sq, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: board square positions are stable
            key={`sq-${i}`}
            type="button"
            onClick={() => handleClick(i)}
            className="w-20 h-20 text-3xl font-bold rounded border border-cyan-DEFAULT/30 bg-navy-mid/50 hover:bg-cyan-DEFAULT/10 hover:border-cyan-DEFAULT/60 transition-all duration-200 glow-border"
            style={{
              color:
                sq === "X" ? "oklch(0.78 0.18 195)" : "oklch(0.65 0.22 25)",
              textShadow: sq ? "0 0 10px currentColor" : "none",
            }}
            data-ocid={`tictactoe.item.${i + 1}`}
          >
            {sq}
          </button>
        ))}
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="border-cyan-DEFAULT/40 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10"
        data-ocid="tictactoe.button"
      >
        <RotateCcw className="w-4 h-4 mr-2" /> New Game
      </Button>
      {wins > 0 && (
        <div className="flex items-center gap-2 text-sm text-yellow-400">
          <Trophy className="w-4 h-4" /> Score: {wins * 10}
        </div>
      )}
    </div>
  );
}
