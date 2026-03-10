import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSaveScore, useTopScores } from "@/hooks/useQueries";
import { Trophy, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { BrickBreaker } from "@/components/games/BrickBreaker";
import { ColorMatch } from "@/components/games/ColorMatch";
import { FlappyBird } from "@/components/games/FlappyBird";
import { Game2048 } from "@/components/games/Game2048";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { Minesweeper } from "@/components/games/Minesweeper";
import { NumberGuess } from "@/components/games/NumberGuess";
import { ReactionTime } from "@/components/games/ReactionTime";
import { RockPaperScissors } from "@/components/games/RockPaperScissors";
import { SimonSays } from "@/components/games/SimonSays";
import { SnakeGame } from "@/components/games/SnakeGame";
import { Sudoku } from "@/components/games/Sudoku";
// Game imports
import { TicTacToe } from "@/components/games/TicTacToe";
import { TypingSpeed } from "@/components/games/TypingSpeed";
import { WhackMole } from "@/components/games/WhackMole";
import { WordScramble } from "@/components/games/WordScramble";

const GAMES = [
  {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe",
    icon: "⭕",
    category: "Strategy",
    desc: "Beat JARVIS's minimax AI",
    color: "#00dcff",
  },
  {
    id: "snake",
    name: "Snake",
    icon: "🐍",
    category: "Arcade",
    desc: "Classic snake — eat & grow",
    color: "#44ff88",
  },
  {
    id: "memory-match",
    name: "Memory Match",
    icon: "🧠",
    category: "Memory",
    desc: "Flip & match 16 cards",
    color: "#aa44ff",
  },
  {
    id: "whack-mole",
    name: "Whack-a-Mole",
    icon: "🦔",
    category: "Arcade",
    desc: "Whack 'em in 30 seconds",
    color: "#ffcc00",
  },
  {
    id: "typing-speed",
    name: "Typing Speed",
    icon: "⌨️",
    category: "Skill",
    desc: "How fast can you type?",
    color: "#ff88aa",
  },
  {
    id: "number-guess",
    name: "Number Guess",
    icon: "🔢",
    category: "Logic",
    desc: "Guess 1-100 with hints",
    color: "#44ccff",
  },
  {
    id: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    icon: "✂️",
    category: "Classic",
    desc: "Beat JARVIS 3 rounds",
    color: "#ff6644",
  },
  {
    id: "flappy-bird",
    name: "Flappy Bird",
    icon: "🐦",
    category: "Arcade",
    desc: "Tap to fly through pipes",
    color: "#88ff44",
  },
  {
    id: "brick-breaker",
    name: "Brick Breaker",
    icon: "🧱",
    category: "Arcade",
    desc: "Break all the bricks",
    color: "#ff4488",
  },
  {
    id: "2048",
    name: "2048",
    icon: "🔷",
    category: "Puzzle",
    desc: "Slide & merge to 2048",
    color: "#00aacc",
  },
  {
    id: "simon-says",
    name: "Simon Says",
    icon: "🎨",
    category: "Memory",
    desc: "Repeat the color sequence",
    color: "#ff8800",
  },
  {
    id: "word-scramble",
    name: "Word Scramble",
    icon: "📝",
    category: "Word",
    desc: "Unscramble the word",
    color: "#cc44ff",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    icon: "💣",
    category: "Logic",
    desc: "Avoid the mines",
    color: "#ff4444",
  },
  {
    id: "reaction-time",
    name: "Reaction Time",
    icon: "⚡",
    category: "Skill",
    desc: "Test your reflexes",
    color: "#ffff00",
  },
  {
    id: "color-match",
    name: "Color Match",
    icon: "🌈",
    category: "Brain",
    desc: "Match color to text",
    color: "#ff44cc",
  },
  {
    id: "sudoku",
    name: "Sudoku",
    icon: "🔲",
    category: "Logic",
    desc: "Fill the 9×9 grid",
    color: "#44ffcc",
  },
];

function GameComponent({
  gameId,
  onScore,
}: { gameId: string; onScore: (s: number) => void }) {
  switch (gameId) {
    case "tic-tac-toe":
      return <TicTacToe onScore={onScore} />;
    case "snake":
      return <SnakeGame onScore={onScore} />;
    case "memory-match":
      return <MemoryMatch onScore={onScore} />;
    case "whack-mole":
      return <WhackMole onScore={onScore} />;
    case "typing-speed":
      return <TypingSpeed onScore={onScore} />;
    case "number-guess":
      return <NumberGuess onScore={onScore} />;
    case "rock-paper-scissors":
      return <RockPaperScissors onScore={onScore} />;
    case "flappy-bird":
      return <FlappyBird onScore={onScore} />;
    case "brick-breaker":
      return <BrickBreaker onScore={onScore} />;
    case "2048":
      return <Game2048 onScore={onScore} />;
    case "simon-says":
      return <SimonSays onScore={onScore} />;
    case "word-scramble":
      return <WordScramble onScore={onScore} />;
    case "minesweeper":
      return <Minesweeper onScore={onScore} />;
    case "reaction-time":
      return <ReactionTime onScore={onScore} />;
    case "color-match":
      return <ColorMatch onScore={onScore} />;
    case "sudoku":
      return <Sudoku onScore={onScore} />;
    default:
      return null;
  }
}

function LeaderboardPanel({ gameName }: { gameName: string }) {
  const { data: scores } = useTopScores(gameName);
  if (!scores || scores.length === 0)
    return <p className="text-xs text-muted-foreground">No scores yet</p>;
  return (
    <div className="space-y-1">
      {scores.slice(0, 5).map((s, i) => (
        <div
          key={`${s.user.toString()}-${i}`}
          className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-navy-dark/50"
        >
          <span className="text-muted-foreground">#{i + 1}</span>
          <span
            className={`font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : "text-amber-600"}`}
          >
            {Number(s.score)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GamesHub() {
  const { identity } = useInternetIdentity();
  const saveScore = useSaveScore();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const categories = [
    "All",
    ...Array.from(new Set(GAMES.map((g) => g.category))),
  ];
  const filtered =
    filter === "All" ? GAMES : GAMES.filter((g) => g.category === filter);

  const handleScore = (gameId: string) => (score: number) => {
    if (identity && score > 0) {
      void saveScore
        .mutateAsync({ gameName: gameId, score: BigInt(Math.round(score)) })
        .catch(console.error);
    }
  };

  const activeGameInfo = GAMES.find((g) => g.id === activeGame);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">
            Games Hub
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            16 games — all powered by JARVIS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400 font-mono">
            {GAMES.length} games
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2" data-ocid="games.tab">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
              filter === cat
                ? "bg-cyan-DEFAULT/20 border-cyan-DEFAULT/60 text-cyan-DEFAULT glow-border"
                : "border-cyan-DEFAULT/20 text-muted-foreground hover:border-cyan-DEFAULT/40 hover:text-foreground"
            }`}
            data-ocid="games.toggle"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((game, idx) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => setActiveGame(game.id)}
            className="p-4 rounded-xl border border-cyan-DEFAULT/15 bg-navy-mid/30 hover:border-opacity-60 hover:bg-navy-mid/60 transition-all duration-200 text-left card-hover-glow group"
            style={{ "--hover-color": game.color } as React.CSSProperties}
            data-ocid={`games.item.${idx + 1}`}
          >
            <div
              className="text-4xl mb-3"
              style={{ filter: `drop-shadow(0 0 8px ${game.color}66)` }}
            >
              {game.icon}
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1 leading-tight">
              {game.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 leading-snug">
              {game.desc}
            </p>
            <Badge
              variant="outline"
              className="text-xs border-opacity-40"
              style={{
                borderColor: `${game.color}66`,
                color: game.color,
                background: `${game.color}11`,
              }}
            >
              {game.category}
            </Badge>
          </motion.button>
        ))}
      </div>

      {/* Game Modal */}
      <Dialog
        open={!!activeGame}
        onOpenChange={(open) => !open && setActiveGame(null)}
      >
        <DialogContent
          className="max-w-2xl bg-navy-dark border-cyan-DEFAULT/30 max-h-[90vh] overflow-y-auto"
          data-ocid="games.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              <span className="text-2xl">{activeGameInfo?.icon}</span>
              <span className="gradient-text font-display">
                {activeGameInfo?.name}
              </span>
              <Badge
                variant="outline"
                className="ml-auto text-xs"
                style={{
                  borderColor: `${activeGameInfo?.color}66`,
                  color: activeGameInfo?.color,
                }}
              >
                {activeGameInfo?.category}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {activeGame && (
              <GameComponent
                gameId={activeGame}
                onScore={handleScore(activeGame)}
              />
            )}
          </div>
          {activeGame && (
            <div className="border-t border-cyan-DEFAULT/15 pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-400" /> Top Scores
              </p>
              <LeaderboardPanel gameName={activeGame} />
            </div>
          )}
          <Button
            variant="ghost"
            className="absolute top-3 right-3 w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setActiveGame(null)}
            data-ocid="games.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
