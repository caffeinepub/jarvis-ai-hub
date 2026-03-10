import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

const W = 360;
const H = 400;
const BIRD_X = 80;
const BIRD_R = 14;
const PIPE_W = 50;
const GAP = 130;
const PIPE_SPEED = 2.5;
const GRAVITY = 0.4;
const JUMP = -7;

interface FlappyBirdProps {
  onScore: (score: number) => void;
}

export function FlappyBird({ onScore }: FlappyBirdProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    birdY: H / 2,
    birdVY: 0,
    pipes: [] as { x: number; gapY: number }[],
    score: 0,
    running: false,
    dead: false,
    frameId: 0,
  });
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#050a14";
    ctx.fillRect(0, 0, W, H);

    // Grid bg
    ctx.strokeStyle = "rgba(0,220,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Pipes
    for (const p of s.pipes) {
      const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      grad.addColorStop(0, "rgba(0,180,220,0.5)");
      grad.addColorStop(1, "rgba(0,100,150,0.5)");
      ctx.fillStyle = grad;
      ctx.shadowColor = "#00dcff";
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
      ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, H);
      ctx.shadowBlur = 0;
    }

    // Bird
    ctx.shadowColor = "#00dcff";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#00dcff";
    ctx.beginPath();
    ctx.arc(BIRD_X, s.birdY, BIRD_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Score
    ctx.fillStyle = "#00dcff";
    ctx.font = "bold 24px 'Geist Mono', monospace";
    ctx.fillText(String(s.score), W / 2 - 10, 40);
  }, []);

  const loop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.birdVY += GRAVITY;
    s.birdY += s.birdVY;

    // Add pipes
    if (s.pipes.length === 0 || s.pipes[s.pipes.length - 1].x < W - 200) {
      s.pipes.push({ x: W, gapY: 80 + Math.random() * (H - GAP - 160) });
    }

    for (const p of s.pipes) {
      p.x -= PIPE_SPEED;
    }
    s.pipes = s.pipes.filter((p) => p.x > -PIPE_W);

    // Score
    for (const p of s.pipes) {
      if (Math.abs(p.x + PIPE_W - BIRD_X) < PIPE_SPEED + 1) {
        s.score++;
        setScore(s.score);
      }
    }

    // Collision
    const died =
      s.birdY - BIRD_R < 0 ||
      s.birdY + BIRD_R > H ||
      s.pipes.some(
        (p) =>
          BIRD_X + BIRD_R > p.x &&
          BIRD_X - BIRD_R < p.x + PIPE_W &&
          (s.birdY - BIRD_R < p.gapY || s.birdY + BIRD_R > p.gapY + GAP),
      );

    if (died) {
      s.running = false;
      s.dead = true;
      setGameOver(true);
      setStarted(false);
      onScore(s.score);
      draw();
      return;
    }

    draw();
    s.frameId = requestAnimationFrame(loop);
  }, [draw, onScore]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.running) {
      s.birdVY = JUMP;
    }
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    cancelAnimationFrame(s.frameId);
    s.birdY = H / 2;
    s.birdVY = 0;
    s.pipes = [];
    s.score = 0;
    s.running = true;
    s.dead = false;
    setScore(0);
    setStarted(true);
    setGameOver(false);
    s.frameId = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);
    draw();
    return () => {
      window.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(stateRef.current.frameId);
    };
  }, [draw, jump]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm font-mono text-cyan-DEFAULT">Score: {score}</div>
      <button
        type="button"
        className="game-canvas-wrapper glow-border rounded-lg overflow-hidden cursor-pointer p-0 border-0 bg-transparent"
        onClick={jump}
        aria-label="Flappy Bird game area - click to flap"
        data-ocid="flappy.canvas_target"
      >
        <canvas ref={canvasRef} width={W} height={H} />
      </button>
      {!started && (
        <Button
          onClick={startGame}
          className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
          data-ocid="flappy.button"
        >
          {gameOver ? "Play Again" : "Start Game"}
        </Button>
      )}
      <p className="text-xs text-muted-foreground">Click or Space to flap</p>
    </div>
  );
}
