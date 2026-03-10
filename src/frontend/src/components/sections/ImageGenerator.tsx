import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddImageRequest,
  useConsumeTokens,
  useImageHistory,
  useUserProfile,
} from "@/hooks/useQueries";
import { AlertTriangle, Clock, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

const STYLES = [
  {
    name: "Realistic",
    icon: "📷",
    desc: "Photorealistic",
    color: "#00dcff",
    bg: "rgba(0,220,255,0.08)",
  },
  {
    name: "Cartoon",
    icon: "🎨",
    desc: "Animated style",
    color: "#ff88aa",
    bg: "rgba(255,136,170,0.08)",
  },
  {
    name: "Sketch",
    icon: "✏️",
    desc: "Hand-drawn",
    color: "#aaaaff",
    bg: "rgba(170,170,255,0.08)",
  },
  {
    name: "Oil Painting",
    icon: "🖼️",
    desc: "Classic art",
    color: "#ffaa44",
    bg: "rgba(255,170,68,0.08)",
  },
  {
    name: "Cyberpunk",
    icon: "⚡",
    desc: "Neon future",
    color: "#ff44ff",
    bg: "rgba(255,68,255,0.08)",
  },
  {
    name: "Watercolor",
    icon: "💧",
    desc: "Flowing colors",
    color: "#44ccff",
    bg: "rgba(68,204,255,0.08)",
  },
  {
    name: "Neon",
    icon: "🌈",
    desc: "Glowing lights",
    color: "#ff0099",
    bg: "rgba(255,0,153,0.08)",
  },
  {
    name: "Pixel Art",
    icon: "🎮",
    desc: "Retro pixels",
    color: "#44ff88",
    bg: "rgba(68,255,136,0.08)",
  },
  {
    name: "Vintage",
    icon: "📻",
    desc: "Retro aesthetic",
    color: "#cc8844",
    bg: "rgba(204,136,68,0.08)",
  },
  {
    name: "Abstract",
    icon: "🌀",
    desc: "Non-figurative",
    color: "#8844ff",
    bg: "rgba(136,68,255,0.08)",
  },
  {
    name: "Anime",
    icon: "✨",
    desc: "Japanese style",
    color: "#ff6688",
    bg: "rgba(255,102,136,0.08)",
  },
  {
    name: "Dark Fantasy",
    icon: "🌑",
    desc: "Gothic dark",
    color: "#aa66ff",
    bg: "rgba(170,102,255,0.08)",
  },
  {
    name: "Minimalist",
    icon: "◻️",
    desc: "Clean simple",
    color: "#ffffff",
    bg: "rgba(255,255,255,0.05)",
  },
  {
    name: "Pop Art",
    icon: "💥",
    desc: "Bold colors",
    color: "#ffff00",
    bg: "rgba(255,255,0,0.08)",
  },
  {
    name: "Impressionist",
    icon: "🌸",
    desc: "Brushstroke art",
    color: "#ff9966",
    bg: "rgba(255,153,102,0.08)",
  },
];

// Style-specific gradient palettes for placeholder
const STYLE_GRADIENTS: Record<string, string> = {
  Realistic: "linear-gradient(135deg, #1a2a3a, #0d3a4a, #1a2a3a)",
  Cartoon: "linear-gradient(135deg, #3a1a2a, #2a0d2a, #3a1a2a)",
  Sketch: "linear-gradient(135deg, #1a1a2a, #0d0d1a, #1a1a2a)",
  "Oil Painting": "linear-gradient(135deg, #2a1a0a, #3a2a10, #2a1a0a)",
  Cyberpunk: "linear-gradient(135deg, #1a0a2a, #2a0a3a, #3a0a2a)",
  Watercolor: "linear-gradient(135deg, #0a1a2a, #0a2a3a, #0a1a2a)",
  Neon: "linear-gradient(135deg, #1a001a, #2a0020, #1a001a)",
  "Pixel Art": "linear-gradient(135deg, #0a1a0a, #001a0a, #0a1a0a)",
  Vintage: "linear-gradient(135deg, #2a1a0a, #1a1000, #2a1a0a)",
  Abstract: "linear-gradient(135deg, #1a0a2a, #0a1a2a, #2a0a1a)",
  Anime: "linear-gradient(135deg, #2a0a1a, #1a0a2a, #2a0a1a)",
  "Dark Fantasy": "linear-gradient(135deg, #0a0a1a, #1a0a2a, #0a0a1a)",
  Minimalist: "linear-gradient(135deg, #0a0a0a, #1a1a1a, #0a0a0a)",
  "Pop Art": "linear-gradient(135deg, #1a1a00, #1a0a00, #1a1a00)",
  Impressionist: "linear-gradient(135deg, #2a1a0a, #1a0a1a, #2a0a0a)",
};

interface GeneratedImage {
  prompt: string;
  style: string;
  timestamp: Date;
}

export function ImageGenerator() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: imageHistory } = useImageHistory();
  const addImageRequest = useAddImageRequest();
  const consumeTokens = useConsumeTokens();
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("Cyberpunk");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const tokenBalance = profile ? Number(profile.tokenBalance) : 0;
  const isLowTokens = tokenBalance < 10;

  const generate = useCallback(async () => {
    if (!prompt.trim() || isGenerating || !identity || tokenBalance < 5) return;
    setIsGenerating(true);

    void Promise.all([
      addImageRequest.mutateAsync({
        prompt: prompt.trim(),
        style: selectedStyle,
      }),
      consumeTokens.mutateAsync({ amount: 5n, actionName: "image_generation" }),
    ]).catch(console.error);

    setTimeout(() => {
      setGeneratedImages((prev) => [
        { prompt: prompt.trim(), style: selectedStyle, timestamp: new Date() },
        ...prev,
      ]);
      setIsGenerating(false);
    }, 2500);
  }, [
    prompt,
    isGenerating,
    identity,
    tokenBalance,
    selectedStyle,
    addImageRequest,
    consumeTokens,
  ]);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <Sparkles className="w-16 h-16 text-cyan-DEFAULT" />
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold mb-2">
            Image Generator
          </h2>
          <p className="text-muted-foreground">
            Log in to generate images with JARVIS.
          </p>
        </div>
      </div>
    );
  }

  const _styleObj = STYLES.find((s) => s.name === selectedStyle);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">
            Image Generator
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create unique artwork with JARVIS vision systems
          </p>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          Cost: 5 tokens • Balance:{" "}
          <span
            className={tokenBalance < 10 ? "text-red-400" : "text-cyan-DEFAULT"}
          >
            {tokenBalance}
          </span>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label
          htmlFor="image-prompt"
          className="text-sm font-medium text-muted-foreground"
        >
          Describe your image
        </label>
        <Textarea
          id="image-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic city at night with holographic billboards, neon reflections in rain puddles..."
          className="bg-navy-mid/50 border-cyan-DEFAULT/30 focus:border-cyan-DEFAULT/60 text-foreground placeholder:text-muted-foreground resize-none h-24"
          data-ocid="image.textarea"
        />
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Style</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {STYLES.map((style, idx) => (
            <button
              key={style.name}
              type="button"
              onClick={() => setSelectedStyle(style.name)}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                selectedStyle === style.name
                  ? "border-opacity-80 scale-105 shadow-lg"
                  : "border-cyan-DEFAULT/15 bg-navy-mid/30 hover:border-cyan-DEFAULT/30 hover:bg-navy-mid/60"
              }`}
              style={
                selectedStyle === style.name
                  ? {
                      borderColor: `${style.color}cc`,
                      background: style.bg,
                      boxShadow: `0 0 12px ${style.color}44`,
                    }
                  : {}
              }
              data-ocid={`image.item.${idx + 1}`}
            >
              <div className="text-xl mb-1">{style.icon}</div>
              <div
                className="text-xs font-medium"
                style={{
                  color: selectedStyle === style.name ? style.color : undefined,
                }}
              >
                {style.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {isLowTokens && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-sm text-yellow-400"
          data-ocid="image.error_state"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Low tokens ({tokenBalance}). Image generation costs 5 tokens.
        </div>
      )}

      <Button
        onClick={generate}
        disabled={isGenerating || !prompt.trim() || tokenBalance < 5}
        className="w-full h-12 text-base font-semibold bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30 hover:shadow-cyan"
        data-ocid="image.primary_button"
      >
        {isGenerating ? (
          <span className="flex items-center gap-3">
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
              <span className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
              <span className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
            </span>
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Generate Image (5 tokens)
          </span>
        )}
      </Button>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Recent Generations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {generatedImages.map((img, i) => {
                const styleInfo = STYLES.find((s) => s.name === img.style);
                return (
                  <motion.div
                    // biome-ignore lint/suspicious/noArrayIndexKey: generated image positions are stable
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl overflow-hidden glow-border"
                  >
                    <div
                      className="h-48 flex items-center justify-center relative overflow-hidden"
                      style={{
                        background:
                          STYLE_GRADIENTS[img.style] ||
                          "linear-gradient(135deg, #0a0a1a, #0a1a2a)",
                      }}
                    >
                      <div className="absolute inset-0 hex-pattern opacity-20" />
                      <div className="text-center p-4 z-10">
                        <div className="text-4xl mb-2">
                          {styleInfo?.icon || "🎨"}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                          {img.prompt.slice(0, 80)}
                          {img.prompt.length > 80 ? "..." : ""}
                        </p>
                      </div>
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${styleInfo?.color || "#00dcff"}22, transparent 70%)`,
                        }}
                      />
                    </div>
                    <div className="p-3 bg-navy-mid/40 border-t border-cyan-DEFAULT/15">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded-full border"
                          style={{
                            color: styleInfo?.color,
                            borderColor: `${styleInfo?.color}44`,
                            background: styleInfo?.bg,
                          }}
                        >
                          {img.style}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{" "}
                          {img.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* History from backend */}
      {imageHistory &&
        imageHistory.length > 0 &&
        generatedImages.length === 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Past Generations
            </h3>
            <div className="space-y-2">
              {imageHistory.slice(0, 5).map((req, i) => {
                const styleInfo = STYLES.find((s) => s.name === req.style);
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: history item positions are stable
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-navy-mid/30 border border-cyan-DEFAULT/15"
                  >
                    <span className="text-xl">{styleInfo?.icon || "🎨"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {req.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.style}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}
