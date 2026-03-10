import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

const W = 360;
const H = 480;
const BALL_R = 8;
const BALL_SPEED = 4;
const PAD_W = 70;
const PAD_H = 10;
const PAD_Y = H - 30;
const COLS = 8;
const ROWS = 5;
const BRICK_W = W / COLS - 4;
const BRICK_H = 18;

const BRICK_COLORS = ["#ff4444", "#ff8800", "#ffcc00", "#44ff44", "#00ccff"];

function makeBricks(): { x: number; y: number; alive: boolean; row: number }[] {
  const arr: { x: number; y: number; alive: boolean; row: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      arr.push({
        x: c * (BRICK_W + 4) + 2,
        y: r * (BRICK_H + 4) + 40,
        alive: true,
        row: r,
      });
    }
  }
  return arr;
}

interface BrickBreakerProps {
  onScore: (score: number) => void;
}

export function BrickBreaker({ onScore }: BrickBreakerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = useRef({
    bx: W / 2,
    by: H - 80,
    vx: BALL_SPEED * 0.7,
    vy: -BALL_SPEED,
    padX: W / 2 - PAD_W / 2,
    bricks: [] as { x: number; y: number; alive: boolean; row: number }[],
    score: 0,
    lives: 3,
    running: false,
    frameId: 0,
  });
  const [_score, setScore] = useState(0);
  const [_lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = s.current;

    ctx.fillStyle = "#050a14";
    ctx.fillRect(0, 0, W, H);

    // Bricks
    for (const b of g.bricks.filter((br) => br.alive)) {
      const color = BRICK_COLORS[b.row % BRICK_COLORS.length];
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = `${color}99`;
      ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, BRICK_W, BRICK_H);
      ctx.shadowBlur = 0;
    }

    // Paddle
    ctx.shadowColor = "#00dcff";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#00dcff";
    ctx.fillRect(g.padX, PAD_Y, PAD_W, PAD_H);
    ctx.shadowBlur = 0;

    // Ball
    ctx.shadowColor = "#00dcff";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#00dcff";
    ctx.beginPath();
    ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // HUD
    ctx.fillStyle = "#00dcff";
    ctx.font = "12px 'Geist Mono', monospace";
    ctx.fillText(`Score: ${g.score}`, 8, 20);
    ctx.fillText(`Lives: ${"❤️".repeat(g.lives)}`, W - 80, 20);
  }, []);

  const loop = useCallback(() => {
    const g = s.current;
    if (!g.running) return;

    g.bx += g.vx;
    g.by += g.vy;

    // Walls
    if (g.bx - BALL_R < 0 || g.bx + BALL_R > W) g.vx = -g.vx;
    if (g.by - BALL_R < 0) g.vy = -g.vy;

    // Paddle
    if (
      g.by + BALL_R >= PAD_Y &&
      g.by + BALL_R <= PAD_Y + PAD_H + 5 &&
      g.bx >= g.padX &&
      g.bx <= g.padX + PAD_W
    ) {
      g.vy = -Math.abs(g.vy);
      const hit = (g.bx - (g.padX + PAD_W / 2)) / (PAD_W / 2);
      g.vx = hit * BALL_SPEED * 1.2;
    }

    // Miss
    if (g.by > H) {
      g.lives--;
      setLives(g.lives);
      if (g.lives <= 0) {
        g.running = false;
        setGameOver(true);
        setStarted(false);
        onScore(g.score);
        draw();
        return;
      }
      g.bx = g.padX + PAD_W / 2;
      g.by = PAD_Y - 30;
      g.vy = -BALL_SPEED;
      g.vx = BALL_SPEED * 0.7;
    }

    // Bricks
    for (const b of g.bricks) {
      if (!b.alive) continue;
      if (
        g.bx + BALL_R > b.x &&
        g.bx - BALL_R < b.x + BRICK_W &&
        g.by + BALL_R > b.y &&
        g.by - BALL_R < b.y + BRICK_H
      ) {
        b.alive = false;
        g.score += 10;
        setScore(g.score);
        g.vy = -g.vy;
        break;
      }
    }

    if (g.bricks.every((b) => !b.alive)) {
      g.running = false;
      setWon(true);
      setStarted(false);
      onScore(g.score + g.lives * 50);
    }

    draw();
    g.frameId = requestAnimationFrame(loop);
  }, [draw, onScore]);

  const startGame = useCallback(() => {
    const g = s.current;
    cancelAnimationFrame(g.frameId);
    g.bricks = makeBricks();
    g.bx = W / 2;
    g.by = H - 80;
    g.vx = BALL_SPEED * 0.7;
    g.vy = -BALL_SPEED;
    g.padX = W / 2 - PAD_W / 2;
    g.score = 0;
    g.lives = 3;
    g.running = true;
    setScore(0);
    setLives(3);
    setStarted(true);
    setGameOver(false);
    setWon(false);
    g.frameId = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      s.current.padX = Math.max(0, Math.min(W - PAD_W, mx - PAD_W / 2));
    };
    const handleTouch = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      s.current.padX = Math.max(0, Math.min(W - PAD_W, tx - PAD_W / 2));
    };
    const canvas = canvasRef.current;
    canvas?.addEventListener("mousemove", handleMouse);
    canvas?.addEventListener("touchmove", handleTouch);
    draw();
    return () => {
      canvas?.removeEventListener("mousemove", handleMouse);
      canvas?.removeEventListener("touchmove", handleTouch);
      cancelAnimationFrame(s.current.frameId);
    };
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="game-canvas-wrapper glow-border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H} />
      </div>
      {!started && (
        <Button
          onClick={startGame}
          className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
          data-ocid="brick.button"
        >
          {gameOver ? "Play Again" : won ? "Next Level" : "Start Game"}
        </Button>
      )}
      {won && (
        <p className="text-green-400 font-bold">🎉 You cleared all bricks!</p>
      )}
      <p className="text-xs text-muted-foreground">
        Move mouse to control paddle
      </p>
    </div>
  );
}
