import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

const EMOJIS = ["🤖", "⚡", "🔮", "💎", "🌌", "🚀", "🎯", "🔬"];
const CARDS_SET = [...EMOJIS, ...EMOJIS];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface MemoryMatchProps {
  onScore: (score: number) => void;
}

export function MemoryMatch({ onScore }: MemoryMatchProps) {
  const [cards, setCards] = useState(() =>
    shuffle(CARDS_SET).map((e, i) => ({
      id: i,
      emoji: e,
      flipped: false,
      matched: false,
    })),
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);

  const handleFlip = useCallback(
    (id: number) => {
      if (lockBoard || selected.length >= 2) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return;

      const newCards = cards.map((c) =>
        c.id === id ? { ...c, flipped: true } : c,
      );
      setCards(newCards);
      const newSel = [...selected, id];
      setSelected(newSel);

      if (newSel.length === 2) {
        setLockBoard(true);
        setMoves((m) => m + 1);
        const [a, b] = newSel.map((id) => newCards.find((c) => c.id === id)!);
        if (a.emoji === b.emoji) {
          const matched = newCards.map((c) =>
            newSel.includes(c.id) ? { ...c, matched: true } : c,
          );
          setCards(matched);
          setSelected([]);
          setLockBoard(false);
          if (matched.every((c) => c.matched)) {
            setWon(true);
            const score = Math.max(100 - moves * 2, 10);
            onScore(score);
          }
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newSel.includes(c.id) ? { ...c, flipped: false } : c,
              ),
            );
            setSelected([]);
            setLockBoard(false);
          }, 800);
        }
      }
    },
    [cards, selected, lockBoard, moves, onScore],
  );

  const reset = () => {
    setCards(
      shuffle(CARDS_SET).map((e, i) => ({
        id: i,
        emoji: e,
        flipped: false,
        matched: false,
      })),
    );
    setSelected([]);
    setMoves(0);
    setWon(false);
    setLockBoard(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-cyan-DEFAULT">Moves: {moves}</span>
        <span className="text-green-400">
          Matched: {cards.filter((c) => c.matched).length / 2}/{EMOJIS.length}
        </span>
      </div>
      {won && (
        <p className="text-yellow-400 font-bold glow-cyan-text">
          🎉 Completed in {moves} moves!
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            type="button"
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 text-2xl rounded-lg border transition-all duration-300 ${
              card.matched
                ? "border-green-400/60 bg-green-400/10 scale-95"
                : card.flipped
                  ? "border-cyan-DEFAULT/60 bg-cyan-DEFAULT/10"
                  : "border-cyan-DEFAULT/20 bg-navy-mid hover:border-cyan-DEFAULT/40 hover:bg-cyan-DEFAULT/5"
            }`}
            data-ocid={`memory.item.${idx + 1}`}
          >
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="border-cyan-DEFAULT/40 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10"
        data-ocid="memory.button"
      >
        New Game
      </Button>
    </div>
  );
}
