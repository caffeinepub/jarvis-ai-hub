import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

interface SnakeGameProps {
  onScore: (score: number) => void;
}

const GRID = 20;
const CELL = 20;
const W = GRID * CELL;

type Dir = { x: number; y: number };
type Point = { x: number; y: number };

export function SnakeGame({ onScore }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    snake: Point[];
    dir: Dir;
    nextDir: Dir;
    food: Point;
    score: number;
    running: boolean;
    intervalId?: ReturnType<typeof setInterval>;
  }>({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 5, y: 5 },
    score: 0,
    running: false,
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const scoreRef = useRef(0);

  const randomFood = useCallback((snake: Point[]): Point => {
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = gameRef.current;

    // Background
    ctx.fillStyle = "#050a14";
    ctx.fillRect(0, 0, W, W);

    // Grid
    ctx.strokeStyle = "rgba(0,220,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, W);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(W, i * CELL);
      ctx.stroke();
    }

    // Snake
    g.snake.forEach((seg, idx) => {
      const alpha = 0.4 + (idx / g.snake.length) * 0.6;
      ctx.fillStyle = `rgba(0, 220, 255, ${alpha})`;
      ctx.shadowColor = "#00dcff";
      ctx.shadowBlur = idx === g.snake.length - 1 ? 15 : 5;
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });

    // Food
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(
      g.food.x * CELL + CELL / 2,
      g.food.y * CELL + CELL / 2,
      CELL / 2 - 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const endGame = useCallback(() => {
    const g = gameRef.current;
    clearInterval(g.intervalId);
    g.running = false;
    setGameOver(true);
    setStarted(false);
    const final = scoreRef.current;
    if (final > highScore) {
      setHighScore(final);
      onScore(final);
    }
  }, [highScore, onScore]);

  const tick = useCallback(() => {
    const g = gameRef.current;
    g.dir = g.nextDir;
    const head = {
      x: g.snake[g.snake.length - 1].x + g.dir.x,
      y: g.snake[g.snake.length - 1].y + g.dir.y,
    };
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      endGame();
      return;
    }
    if (g.snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }
    g.snake.push(head);
    if (head.x === g.food.x && head.y === g.food.y) {
      g.score++;
      scoreRef.current = g.score;
      setScore(g.score);
      g.food = randomFood(g.snake);
    } else {
      g.snake.shift();
    }
    draw();
  }, [draw, endGame, randomFood]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    if (g.intervalId) clearInterval(g.intervalId);
    g.snake = [{ x: 10, y: 10 }];
    g.dir = { x: 1, y: 0 };
    g.nextDir = { x: 1, y: 0 };
    g.food = randomFood(g.snake);
    g.score = 0;
    g.running = true;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    draw();
    g.intervalId = setInterval(tick, 150);
  }, [draw, tick, randomFood]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g.running) return;
      if (e.key === "ArrowUp" && g.dir.y !== 1) g.nextDir = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && g.dir.y !== -1) g.nextDir = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && g.dir.x !== 1) g.nextDir = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && g.dir.x !== -1) g.nextDir = { x: 1, y: 0 };
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (gameRef.current.intervalId) clearInterval(gameRef.current.intervalId);
    };
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-cyan-DEFAULT">Score: {score}</span>
        <span className="text-yellow-400">Best: {highScore}</span>
      </div>
      <div className="game-canvas-wrapper glow-border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} width={W} height={W} />
      </div>
      <div className="flex gap-2">
        {!started && (
          <Button
            onClick={startGame}
            className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
            data-ocid="snake.button"
          >
            {gameOver ? "Play Again" : "Start Game"}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Use arrow keys to control</p>
      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-1 mt-2 md:hidden">
        <div />
        <Button
          size="sm"
          variant="outline"
          className="border-cyan-DEFAULT/30"
          onClick={() => {
            if (gameRef.current.dir.y !== 1)
              gameRef.current.nextDir = { x: 0, y: -1 };
          }}
        >
          ↑
        </Button>
        <div />
        <Button
          size="sm"
          variant="outline"
          className="border-cyan-DEFAULT/30"
          onClick={() => {
            if (gameRef.current.dir.x !== 1)
              gameRef.current.nextDir = { x: -1, y: 0 };
          }}
        >
          ←
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-cyan-DEFAULT/30"
          onClick={() => {
            if (gameRef.current.dir.y !== -1)
              gameRef.current.nextDir = { x: 0, y: 1 };
          }}
        >
          ↓
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-cyan-DEFAULT/30"
          onClick={() => {
            if (gameRef.current.dir.x !== -1)
              gameRef.current.nextDir = { x: 1, y: 0 };
          }}
        >
          →
        </Button>
      </div>
    </div>
  );
}
