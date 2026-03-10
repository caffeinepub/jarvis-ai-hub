import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";

const WORDS = [
  { word: "JARVIS", hint: "Tony Stark's AI assistant" },
  { word: "QUANTUM", hint: "Subatomic physics" },
  { word: "NEURAL", hint: "Related to the brain" },
  { word: "PHOTON", hint: "Particle of light" },
  { word: "CYBORG", hint: "Part human, part machine" },
  { word: "PLASMA", hint: "Fourth state of matter" },
  { word: "NEBULA", hint: "Cloud of gas in space" },
  { word: "VECTOR", hint: "Direction and magnitude" },
  { word: "MATRIX", hint: "Sci-fi movie / math concept" },
  { word: "HOLOGRAM", hint: "3D light projection" },
  { word: "FUSION", hint: "Nuclear energy process" },
  { word: "ANDROID", hint: "Humanoid robot" },
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word ? scramble(word) : result;
}

interface WordScrambleProps {
  onScore: (score: number) => void;
}

export function WordScramble({ onScore }: WordScrambleProps) {
  const [idx, setIdx] = useState(0);
  const [shuffled, setShuffled] = useState(() => scramble(WORDS[0].word));
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const current = WORDS[idx];

  const checkGuess = useCallback(() => {
    if (guess.toUpperCase() === current.word) {
      const pts = Math.max(10 - hints * 3, 3);
      const newScore = score + pts;
      setScore(newScore);
      onScore(newScore);
      setResult("correct");
    } else {
      setResult("wrong");
      setTimeout(() => setResult(null), 800);
    }
  }, [guess, current.word, hints, score, onScore]);

  const nextWord = () => {
    const newIdx = (idx + 1) % WORDS.length;
    setIdx(newIdx);
    setShuffled(scramble(WORDS[newIdx].word));
    setGuess("");
    setResult(null);
    setHints(0);
    setShowHint(false);
  };

  const getHint = () => {
    setHints((h) => h + 1);
    setShowHint(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="text-sm font-mono text-cyan-DEFAULT">Score: {score}</div>
      <div className="p-6 rounded-xl glow-border text-center w-full">
        <p className="text-3xl font-mono font-bold tracking-widest text-foreground mb-2">
          {shuffled.split("").map((c, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: character positions are stable
              key={`sc-${i}`}
              className="inline-block mx-1 text-cyan-DEFAULT glow-cyan-text"
            >
              {c}
            </span>
          ))}
        </p>
        {showHint && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 Hint: {current.hint}
          </p>
        )}
      </div>
      {result === "correct" ? (
        <div className="text-green-400 font-bold text-center">
          <p>✅ Correct! +{Math.max(10 - hints * 3, 3)} points</p>
          <Button
            onClick={nextWord}
            className="mt-2 bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
            data-ocid="scramble.button"
          >
            Next Word →
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 w-full">
            <Input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkGuess()}
              placeholder="Type the word..."
              className={`bg-navy-mid/50 text-foreground uppercase tracking-widest ${result === "wrong" ? "border-red-400/60" : "border-cyan-DEFAULT/30 focus:border-cyan-DEFAULT/60"}`}
              data-ocid="scramble.input"
            />
            <Button
              onClick={checkGuess}
              className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
              data-ocid="scramble.submit_button"
            >
              Check
            </Button>
          </div>
          <Button
            onClick={getHint}
            variant="ghost"
            className="text-muted-foreground text-xs hover:text-foreground"
            data-ocid="scramble.secondary_button"
          >
            Get Hint (-3pts)
          </Button>
        </>
      )}
    </div>
  );
}
