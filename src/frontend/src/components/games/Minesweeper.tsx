import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

const ROWS = 8;
const COLS = 10;
const MINES = 12;

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
};

function createBoard(): Cell[][] {
  const board: Cell[][] = Array(ROWS)
    .fill(null)
    .map(() =>
      Array(COLS)
        .fill(null)
        .map(() => ({
          mine: false,
          revealed: false,
          flagged: false,
          count: 0,
        })),
    );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            board[nr][nc].mine
          )
            count++;
        }
      board[r][c].count = count;
    }
  return board;
}

function reveal(board: Cell[][], r: number, c: number): Cell[][] {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return board;
  if (board[r][c].revealed || board[r][c].flagged) return board;
  const b = board.map((row) => row.map((cell) => ({ ...cell })));
  b[r][c].revealed = true;
  if (b[r][c].count === 0 && !b[r][c].mine) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        reveal(b, r + dr, c + dc).forEach((row, i) => {
          row.forEach((cell, j) => {
            b[i][j] = cell;
          });
        });
      }
  }
  return b;
}

interface MinesweeperProps {
  onScore: (score: number) => void;
}

export function Minesweeper({ onScore }: MinesweeperProps) {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [flagCount, setFlagCount] = useState(0);

  const handleClick = useCallback(
    (r: number, c: number) => {
      if (status !== "playing" || board[r][c].revealed || board[r][c].flagged)
        return;
      if (board[r][c].mine) {
        // Reveal all mines
        const b = board.map((row) =>
          row.map((cell) => ({
            ...cell,
            revealed: cell.mine ? true : cell.revealed,
          })),
        );
        setBoard(b);
        setStatus("lost");
        return;
      }
      const newBoard = reveal(
        board.map((row) => row.map((c) => ({ ...c }))),
        r,
        c,
      );
      setBoard(newBoard);
      const revealed = newBoard
        .flat()
        .filter((c) => c.revealed && !c.mine).length;
      if (revealed === ROWS * COLS - MINES) {
        setStatus("won");
        onScore(100 + (MINES - flagCount) * 5);
      }
    },
    [board, status, flagCount, onScore],
  );

  const handleFlag = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      if (status !== "playing" || board[r][c].revealed) return;
      const b = board.map((row) => row.map((cell) => ({ ...cell })));
      b[r][c].flagged = !b[r][c].flagged;
      setBoard(b);
      setFlagCount((prev) => prev + (b[r][c].flagged ? 1 : -1));
    },
    [board, status],
  );

  const reset = () => {
    setBoard(createBoard());
    setStatus("playing");
    setFlagCount(0);
  };

  const getCellStyle = (cell: Cell) => {
    if (cell.mine && cell.revealed) return "bg-red-500/30 border-red-500/60";
    if (cell.revealed) return "bg-navy-mid/80 border-cyan-DEFAULT/20";
    if (cell.flagged) return "bg-yellow-500/20 border-yellow-500/40";
    return "bg-navy-dark border-cyan-DEFAULT/15 hover:bg-navy-light/50 hover:border-cyan-DEFAULT/30 cursor-pointer";
  };

  const getCountColor = (n: number) =>
    [
      "",
      "text-cyan-bright",
      "text-green-400",
      "text-red-400",
      "text-purple-400",
      "text-orange-400",
      "text-teal-400",
      "text-pink-400",
      "text-yellow-400",
    ][n] || "";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-red-400">💣 {MINES - flagCount}</span>
        <span
          className={
            status === "won"
              ? "text-green-400"
              : status === "lost"
                ? "text-red-400"
                : "text-cyan-DEFAULT"
          }
        >
          {status === "won"
            ? "✅ You Won!"
            : status === "lost"
              ? "💥 Boom!"
              : "Playing..."}
        </span>
      </div>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              type="button"
              // biome-ignore lint/suspicious/noArrayIndexKey: grid cell positions are stable
              key={`cell-${r}-${c}`}
              onClick={() => handleClick(r, c)}
              onContextMenu={(e) => handleFlag(e, r, c)}
              className={`w-8 h-8 text-xs font-bold rounded-sm border transition-all duration-100 ${getCellStyle(cell)}`}
              data-ocid={`mine.item.${r * COLS + c + 1}`}
            >
              {cell.flagged && !cell.revealed ? (
                "🚩"
              ) : cell.revealed ? (
                cell.mine ? (
                  "💣"
                ) : cell.count > 0 ? (
                  <span className={getCountColor(cell.count)}>
                    {cell.count}
                  </span>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </button>
          )),
        )}
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="border-cyan-DEFAULT/40 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10"
        data-ocid="mine.button"
      >
        New Game
      </Button>
      <p className="text-xs text-muted-foreground">Right-click to flag mines</p>
    </div>
  );
}
