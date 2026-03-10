import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

type Grid = number[][];

function createGrid(): Grid {
  const g: Grid = Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));
  addTile(g);
  addTile(g);
  return g;
}

function addTile(g: Grid) {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) if (!g[r][c]) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter(Boolean);
  let score = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < 4) filtered.push(0);
  return { row: filtered, score };
}

function move(
  grid: Grid,
  dir: "left" | "right" | "up" | "down",
): { grid: Grid; score: number; changed: boolean } {
  const g = grid.map((r) => [...r]);
  let score = 0;
  let changed = false;

  const processRows = (rows: number[][]): number[][] =>
    rows.map((row) => {
      const { row: newRow, score: s } = slide(row);
      score += s;
      if (newRow.join() !== row.join()) changed = true;
      return newRow;
    });

  if (dir === "left") {
    const nr = processRows(g);
    return { grid: nr, score, changed };
  }
  if (dir === "right") {
    const rev = g.map((r) => [...r].reverse());
    const nr = processRows(rev).map((r) => r.reverse());
    return { grid: nr, score, changed };
  }
  const transposed = g[0].map((_, c) => g.map((r) => r[c]));
  if (dir === "up") {
    const nr = processRows(transposed);
    return { grid: nr[0].map((_, c) => nr.map((r) => r[c])), score, changed };
  }
  const rev = transposed.map((r) => [...r].reverse());
  const nr = processRows(rev).map((r) => r.reverse());
  return { grid: nr[0].map((_, c) => nr.map((r) => r[c])), score, changed };
}

const TILE_COLORS: Record<number, string> = {
  2: "#1a2a3a",
  4: "#1a3a3a",
  8: "#0d3344",
  16: "#0d4455",
  32: "#0d5566",
  64: "#0d6677",
  128: "#0a5566",
  256: "#0a6677",
  512: "#0a7788",
  1024: "#0a8899",
  2048: "#00aacc",
};

interface Game2048Props {
  onScore: (score: number) => void;
}

function checkOver(g: Grid): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!g[r][c]) return false;
      if (c < 3 && g[r][c] === g[r][c + 1]) return false;
      if (r < 3 && g[r][c] === g[r + 1][c]) return false;
    }
  return true;
}

export function Game2048({ onScore }: Game2048Props) {
  const [grid, setGrid] = useState<Grid>(createGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);

  const handleMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (over) return;
      setGrid((prev) => {
        const { grid: newG, score: gained, changed } = move(prev, dir);
        if (!changed) return prev;
        addTile(newG);
        setScore((s) => {
          const ns = s + gained;
          if (ns > best) {
            setBest(ns);
            onScore(ns);
          }
          return ns;
        });
        if (checkOver(newG)) setOver(true);
        return newG;
      });
    },
    [over, best, onScore],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      if (map[e.key]) {
        e.preventDefault();
        handleMove(map[e.key]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleMove]);

  const reset = () => {
    setGrid(createGrid());
    setScore(0);
    setOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm font-mono">
        <span className="text-cyan-DEFAULT">Score: {score}</span>
        <span className="text-yellow-400">Best: {best}</span>
      </div>
      {over && <p className="text-red-400 font-bold">Game Over!</p>}
      <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-navy-mid/40 glow-border">
        {grid.flatMap((row, r) =>
          row.map((val, c) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: grid cell positions are stable
              key={`cell-${r}-${c}`}
              className="w-14 h-14 flex items-center justify-center rounded-lg text-sm font-bold font-mono transition-all duration-100"
              style={{
                background: val
                  ? TILE_COLORS[val] || "#00aacc"
                  : "rgba(0,220,255,0.05)",
                color: val >= 8 ? "#00dcff" : "#6699aa",
                border: val
                  ? "1px solid rgba(0,220,255,0.3)"
                  : "1px solid rgba(0,220,255,0.1)",
                boxShadow: val ? "0 0 8px rgba(0,220,255,0.2)" : "none",
                fontSize: val >= 1000 ? "12px" : "16px",
              }}
            >
              {val || ""}
            </div>
          )),
        )}
      </div>
      <div className="flex gap-2">
        {["up", "left", "down", "right"].map((d, i) => (
          <Button
            key={d}
            size="sm"
            variant="outline"
            className="w-10 border-cyan-DEFAULT/30 text-cyan-DEFAULT"
            onClick={() => handleMove(d as "left" | "right" | "up" | "down")}
            data-ocid={`game2048.item.${i + 1}`}
          >
            {d === "up" ? "↑" : d === "left" ? "←" : d === "down" ? "↓" : "→"}
          </Button>
        ))}
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="border-cyan-DEFAULT/40 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10"
        data-ocid="game2048.button"
      >
        New Game
      </Button>
      <p className="text-xs text-muted-foreground">
        Arrow keys or buttons to move
      </p>
    </div>
  );
}
