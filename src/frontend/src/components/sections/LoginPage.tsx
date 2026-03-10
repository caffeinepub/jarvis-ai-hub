import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  Gamepad2,
  Image,
  Loader2,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const FEATURES = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "JARVIS Talk",
    desc: "Context-aware AI conversation",
    color: "#00dcff",
    cost: "2 tokens",
  },
  {
    icon: <Image className="w-5 h-5" />,
    title: "Image Generator",
    desc: "15 stunning style filters",
    color: "#aa44ff",
    cost: "5 tokens",
  },
  {
    icon: <Gamepad2 className="w-5 h-5" />,
    title: "16+ Games",
    desc: "Arcade, puzzle & skill games",
    color: "#44ff88",
    cost: "Free",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Token System",
    desc: "100/mo free · 500/mo premium",
    color: "#ffcc00",
    cost: "",
  },
];

function ArcReactorLarge() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Outer slow ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-DEFAULT/20 animate-spin-slow" />
      {/* Mid counter ring */}
      <div
        className="absolute inset-3 rounded-full border border-cyan-DEFAULT/30"
        style={{ animation: "counter-rotate 6s linear infinite" }}
      />
      {/* Dashed ring */}
      <div
        className="absolute inset-6 rounded-full border border-dashed border-cyan-DEFAULT/20"
        style={{ animation: "counter-rotate 12s linear infinite" }}
      />
      {/* Core glow */}
      <div
        className="absolute inset-10 rounded-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle, rgba(0,220,255,0.15) 0%, rgba(0,220,255,0.05) 70%)",
          boxShadow:
            "0 0 40px rgba(0,220,255,0.7), 0 0 80px rgba(0,220,255,0.3), inset 0 0 25px rgba(0,220,255,0.2)",
        }}
      >
        <img
          src="/assets/generated/jarvis-logo-transparent.dim_120x120.png"
          alt="JARVIS"
          className="w-16 h-16 object-contain"
        />
      </div>
      {/* Orbital dots */}
      {([0, 45, 90, 135, 180, 225, 270, 315] as const).map((deg) => (
        <div
          key={deg}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT"
          style={{
            top: `${50 - 46 * Math.cos((deg * Math.PI) / 180)}%`,
            left: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 6px rgba(0,220,255,0.9)",
            opacity: deg % 90 === 0 ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-DEFAULT/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background hex-pattern relative overflow-hidden flex flex-col">
      {/* Ambient glow layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,220,255,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(170,68,255,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute w-full h-px opacity-15"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,220,255,0.6), transparent)",
            animation: "scan 8s linear infinite",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-cyan-DEFAULT/10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-cyan-DEFAULT/40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
          </div>
          <span className="font-display font-bold text-sm gradient-text tracking-widest uppercase">
            J.A.R.V.I.S
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-DEFAULT/50 font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>Systems Online</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Hero block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-14"
          >
            {/* Arc reactor */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="mb-8"
            >
              <ArcReactorLarge />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-xs font-mono text-cyan-DEFAULT/60 tracking-[0.35em] uppercase mb-3">
                Initializing Command Interface
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black gradient-text mb-4 leading-none">
                JARVIS AI Hub
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-mono tracking-wide">
                Your AI-Powered Command Center
              </p>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="mt-6 mx-auto w-48 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.78 0.18 195 / 60%), transparent)",
              }}
            />
          </motion.div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 + i * 0.08 }}
                className="relative p-4 rounded-xl card-hover-glow group cursor-default"
                style={{
                  background: "rgba(0,10,25,0.7)",
                  border: `1px solid ${feature.color}22`,
                  boxShadow: `0 0 15px ${feature.color}10`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-4 right-4 h-px rounded-full opacity-60"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                  }}
                />
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-200"
                  style={{
                    background: `${feature.color}12`,
                    border: `1px solid ${feature.color}30`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <p className="font-semibold text-foreground text-sm mb-0.5 font-display">
                  {feature.title}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {feature.desc}
                </p>
                {feature.cost && (
                  <span
                    className="mt-2 inline-block text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{
                      color: feature.color,
                      background: `${feature.color}12`,
                      border: `1px solid ${feature.color}30`,
                    }}
                  >
                    {feature.cost}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Login button */}
            <div className="relative">
              {/* Button glow ring */}
              <div
                className="absolute -inset-1 rounded-xl opacity-50 blur-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,220,255,0.4), rgba(170,68,255,0.3))",
                }}
              />
              <Button
                onClick={() => void login()}
                disabled={isLoggingIn}
                className="relative h-14 px-10 rounded-xl font-display font-bold text-base tracking-wide transition-all duration-200"
                style={{
                  background: isLoggingIn
                    ? "oklch(0.12 0.022 255)"
                    : "linear-gradient(135deg, oklch(0.78 0.18 195), oklch(0.65 0.22 280))",
                  border: "1px solid rgba(0,220,255,0.4)",
                  color: isLoggingIn
                    ? "oklch(0.78 0.18 195)"
                    : "oklch(0.05 0.02 255)",
                  boxShadow: isLoggingIn
                    ? "none"
                    : "0 0 20px rgba(0,220,255,0.4), 0 0 60px rgba(0,220,255,0.15)",
                }}
                data-ocid="login.primary_button"
              >
                <AnimatePresence mode="wait">
                  {isLoggingIn ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                      data-ocid="login.loading_state"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Connect with Internet Identity
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            {/* Sub-caption */}
            <p className="text-xs text-muted-foreground font-mono text-center max-w-xs leading-relaxed">
              Secure, decentralized authentication — no passwords, no trackers.
              <br />
              <span className="text-cyan-DEFAULT/60">
                Free: 100 tokens/mo &nbsp;·&nbsp; Premium: 500 tokens/mo
              </span>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-DEFAULT/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground font-mono">
          Just A Rather Very Intelligent System
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-red-400">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-DEFAULT/70 hover:text-cyan-DEFAULT transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
