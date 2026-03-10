import { Button } from "@/components/ui/button";
import { useCallback, useRef, useState } from "react";

const TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank at sunset.",
  "Artificial intelligence will transform the way humans interact with technology.",
  "JARVIS stands for Just A Rather Very Intelligent System built by Tony Stark.",
  "In the future robots and humans will work together to solve global problems.",
  "Quantum computing will revolutionize cryptography and data processing forever.",
];

interface TypingSpeedProps {
  onScore: (score: number) => void;
}

export function TypingSpeed({ onScore }: TypingSpeedProps) {
  const [textIdx] = useState(() => Math.floor(Math.random() * TEXTS.length));
  const target = TEXTS[textIdx];
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback(
    (val: string) => {
      if (done) return;
      if (!startTime) setStartTime(Date.now());
      setInput(val);

      if (val.length >= target.length) {
        const elapsed = (Date.now() - (startTime || Date.now())) / 60000;
        const words = target.split(" ").length;
        const wpmCalc = Math.round(words / Math.max(elapsed, 0.001));
        let correct = 0;
        for (let i = 0; i < val.length; i++) {
          if (val[i] === target[i]) correct++;
        }
        const acc = Math.round((correct / target.length) * 100);
        setWpm(wpmCalc);
        setAccuracy(acc);
        setDone(true);
        onScore(wpmCalc);
      }
    },
    [done, startTime, target, onScore],
  );

  const reset = () => {
    setInput("");
    setStartTime(null);
    setWpm(null);
    setAccuracy(null);
    setDone(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      <div className="p-4 rounded-lg glow-border bg-navy-mid/30">
        <p className="font-mono text-sm leading-relaxed">
          {target.split("").map((char, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: character positions are stable
              key={`char-${i}`}
              className={
                i < input.length
                  ? input[i] === char
                    ? "text-green-400"
                    : "text-red-400 bg-red-400/20"
                  : i === input.length
                    ? "text-foreground border-b-2 border-cyan-DEFAULT"
                    : "text-muted-foreground"
              }
            >
              {char}
            </span>
          ))}
        </p>
      </div>
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        disabled={done}
        placeholder="Start typing here..."
        className="w-full h-20 p-3 rounded-lg bg-navy-mid/50 border border-cyan-DEFAULT/30 text-foreground font-mono text-sm focus:outline-none focus:border-cyan-DEFAULT/60 resize-none"
        data-ocid="typing.textarea"
      />
      {done && wpm && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg glow-border text-center">
            <p className="text-3xl font-bold text-cyan-DEFAULT glow-cyan-text">
              {wpm}
            </p>
            <p className="text-xs text-muted-foreground">WPM</p>
          </div>
          <div className="p-3 rounded-lg glow-border text-center">
            <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>
      )}
      <Button
        onClick={reset}
        variant="outline"
        className="border-cyan-DEFAULT/40 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10"
        data-ocid="typing.button"
      >
        New Test
      </Button>
    </div>
  );
}
