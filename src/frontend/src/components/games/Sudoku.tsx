import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

// Pre-filled Sudoku puzzles (0 = empty)
const PUZZLES = [
  [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0],
  ],
];

const SOLUTIONS = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [4, 3, 5, 2, 6, 9, 7, 8, 1],
    [6, 8, 2, 5, 7, 1, 4, 9, 3],
    [1, 9, 7, 8, 3, 4, 5, 6, 2],
    [8, 2, 6, 1, 9, 5, 3, 4, 7],
    [3, 7, 4, 6, 8, 2, 9, 1, 5],
    [9, 5, 1, 7, 4, 3, 6, 2, 8],
    [5, 1, 9, 3, 2, 6, 8, 7, 4],
    [2, 4, 8, 9, 5, 7, 1, 3, 6],
    [7, 6, 3, 4, 1, 8, 2, 5, 9],
  ],
];

interface SudokuProps {
  onScore: (score: number) => void;
}

export function Sudoku({ onScore }: SudokuProps) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = PUZZLES[puzzleIdx];
  const solution = SOLUTIONS[puzzleIdx];
  const [grid, setGrid] = useState(() => puzzle.map((row) => [...row]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  const handleInput = useCallback(
    (val: string) => {
      if (!selected || solved) return;
      const [r, c] = selected;
      if (puzzle[r][c] !== 0) return;
      const num = Number.parseInt(val);
      if (Number.isNaN(num) || num < 1 || num > 9) return;
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);
      const key = `${r}-${c}`;
      if (num !== solution[r][c]) {
        setErrors((prev) => new Set([...prev, key]));
        setMistakeCount((m) => m + 1);
      } else {
        setErrors((prev) => {
          const n = new Set(prev);
          n.delete(key);
          return n;
        });
        if (
          newGrid.every((row, ri) =>
            row.every((v, ci) => v === solution[ri][ci]),
          )
        ) {
          setSolved(true);
          onScore(Math.max(100 - mistakeCount * 5, 10));
        }
      }
    },
    [selected, solved, puzzle, solution, grid, mistakeCount, onScore],
  );

  const reset = () => {
    const newIdx = (puzzleIdx + 1) % PUZZLES.length;
    setPuzzleIdx(newIdx);
    setGrid(PUZZLES[newIdx].map((row) => [...row]));
    setSelected(null);
    setErrors(new Set());
    setSolved(false);
    setMistakeCount(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-red-400">Mistakes: {mistakeCount}</span>
        {solved && <span className="text-green-400">✅ Solved!</span>}
      </div>
      <div
        className="rounded-xl overflow-hidden glow-border"
        style={{ background: "rgba(0,10,20,0.8)" }}
      >
        {grid.map((row, r) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: grid row positions are stable
            key={`row-${r}`}
            className="flex"
            style={{
              borderBottom:
                (r + 1) % 3 === 0 && r !== 8
                  ? "2px solid rgba(0,220,255,0.3)"
                  : "none",
            }}
          >
            {row.map((val, c) => {
              const isFixed = puzzle[r][c] !== 0;
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const hasError = errors.has(`${r}-${c}`);
              return (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: grid cell positions are stable
                  key={`cell-${r}-${c}`}
                  type="button"
                  onClick={() => !isFixed && setSelected([r, c])}
                  className={`w-9 h-9 text-sm font-mono font-bold flex items-center justify-center transition-all
                    ${(c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-cyan-DEFAULT/30" : "border-r border-cyan-DEFAULT/10"}
                    ${isSelected ? "bg-cyan-DEFAULT/20" : isFixed ? "bg-transparent" : "bg-navy-dark/50 hover:bg-cyan-DEFAULT/10"}
                    ${isFixed ? "text-foreground" : hasError ? "text-red-400" : "text-cyan-DEFAULT"}
                  `}
                  data-ocid={`sudoku.item.${r * 9 + c + 1}`}
                >
                  {val || ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {selected && !puzzle[selected[0]][selected[1]] && (
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button
              key={n}
              size="sm"
              variant="outline"
              onClick={() => handleInput(String(n))}
              className="w-9 h-9 border-cyan-DEFAULT/30 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10 font-mono"
              data-ocid={`sudoku.item.${n + 81}`}
            >
              {n}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (selected) {
                const [r, c] = selected;
                if (puzzle[r][c] === 0) {
                  const ng = grid.map((row) => [...row]);
                  ng[r][c] = 0;
                  setGrid(ng);
                  setErrors((prev) => {
                    const n = new Set(prev);
                    n.delete(`${r}-${c}`);
                    return n;
                  });
                }
              }
            }}
            className="w-9 h-9 border-red-400/30 text-red-400 hover:bg-red-400/10"
            data-ocid="sudoku.delete_button"
          >
            ✕
          </Button>
        </div>
      )}
      <Button
        onClick={reset}
        variant="outline"
        className="border-cyan-DEFAULT/40 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10"
        data-ocid="sudoku.button"
      >
        New Puzzle
      </Button>
    </div>
  );
}
