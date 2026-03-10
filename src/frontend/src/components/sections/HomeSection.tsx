import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useChatHistory,
  useImageHistory,
  useUserProfile,
} from "@/hooks/useQueries";
import {
  Crown,
  Gamepad2,
  Image,
  MessageSquare,
  Sparkles,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

interface HomeSectionProps {
  onNavigate: (section: string) => void;
}

function ArcReactor() {
  return (
    <div className="arc-reactor relative w-32 h-32 mx-auto">
      {/* Outer rings */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-DEFAULT/20 ring-rotate" />
      <div className="absolute inset-2 rounded-full border border-cyan-DEFAULT/30 ring-counter-rotate" />
      {/* Inner glow circle */}
      <div
        className="absolute inset-6 rounded-full bg-cyan-DEFAULT/10 flex items-center justify-center"
        style={{
          boxShadow:
            "0 0 30px rgba(0,220,255,0.6), 0 0 60px rgba(0,220,255,0.3), inset 0 0 20px rgba(0,220,255,0.2)",
        }}
      >
        <img
          src="/assets/generated/jarvis-logo-transparent.dim_120x120.png"
          alt="JARVIS"
          className="w-14 h-14 object-contain"
        />
      </div>
      {/* Decorative dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative dot positions are stable
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cyan-DEFAULT"
          style={{
            top: `${50 - 42 * Math.cos((deg * Math.PI) / 180)}%`,
            left: `${50 + 42 * Math.sin((deg * Math.PI) / 180)}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 6px rgba(0,220,255,0.8)",
            opacity: 0.6 + (i % 2) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    id: "chat",
    label: "Talk to JARVIS",
    icon: <MessageSquare className="w-6 h-6" />,
    desc: "AI conversation",
    color: "#00dcff",
    cost: "2 tokens",
  },
  {
    id: "image",
    label: "Generate Image",
    icon: <Sparkles className="w-6 h-6" />,
    desc: "Create artwork",
    color: "#aa44ff",
    cost: "5 tokens",
  },
  {
    id: "games",
    label: "Play Games",
    icon: <Gamepad2 className="w-6 h-6" />,
    desc: "16 games",
    color: "#44ff88",
    cost: "Free",
  },
  {
    id: "profile",
    label: "Your Profile",
    icon: <User className="w-6 h-6" />,
    desc: "Stats & tokens",
    color: "#ffcc00",
    cost: "",
  },
];

export function HomeSection({ onNavigate }: HomeSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: chatHistory } = useChatHistory();
  const { data: imageHistory } = useImageHistory();

  const tokenBalance = profile ? Number(profile.tokenBalance) : 0;
  const isPremium = profile?.tier === "premium";
  const maxTokens = isPremium ? 500 : 100;
  const tokenPercent = Math.min((tokenBalance / maxTokens) * 100, 100);

  const stats = [
    {
      label: "Tokens Left",
      value: tokenBalance,
      icon: <Zap className="w-4 h-4" />,
      color: "text-cyan-DEFAULT",
    },
    {
      label: "Messages",
      value: chatHistory?.filter((m) => m.role === "user").length || 0,
      icon: <MessageSquare className="w-4 h-4" />,
      color: "text-blue-400",
    },
    {
      label: "Images",
      value: imageHistory?.length || 0,
      icon: <Image className="w-4 h-4" />,
      color: "text-purple-400",
    },
    {
      label: "Tier",
      value: isPremium ? "Premium" : "Free",
      icon: <Crown className="w-4 h-4" />,
      color: isPremium ? "text-yellow-400" : "text-muted-foreground",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,10,25,0.95), rgba(0,20,40,0.9))",
          border: "1px solid rgba(0,220,255,0.2)",
          boxShadow: "0 0 40px rgba(0,220,255,0.1)",
        }}
      >
        <div className="absolute inset-0 hex-pattern opacity-40 pointer-events-none" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(0,220,255,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <ArcReactor />
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm font-mono text-cyan-DEFAULT/70 mb-2 tracking-widest uppercase">
              {identity ? "Welcome back," : "Welcome to"}
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-3">
              JARVIS AI Hub
            </h1>
            <p className="text-muted-foreground max-w-md leading-relaxed text-sm">
              Just A Rather Very Intelligent System. Your AI assistant, game
              companion, and creative partner — all in one place.
            </p>
            {identity && profile && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {tokenBalance} tokens remaining
                  </span>
                  {isPremium && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-400/40 text-yellow-400 premium-gradient bg-clip-padding">
                      Premium
                    </span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-navy-dark overflow-hidden max-w-xs">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tokenPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full token-bar"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats (when logged in) */}
      {identity && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="p-4 rounded-xl glow-border bg-navy-mid/30 text-center"
              data-ocid={`home.item.${i + 1}`}
            >
              <div className={`flex justify-center mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className={`text-xl font-bold font-mono ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Quick Launch
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => onNavigate(action.id)}
              className="flex items-center gap-4 p-5 rounded-xl border border-opacity-20 bg-navy-mid/20 hover:bg-navy-mid/50 transition-all duration-200 text-left card-hover-glow group"
              style={{ borderColor: `${action.color}33` }}
              data-ocid={`home.item.${i + 5}`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: `${action.color}15`,
                  color: action.color,
                  border: `1px solid ${action.color}33`,
                }}
              >
                {action.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
              {action.cost && (
                <span
                  className="text-xs font-mono px-2 py-1 rounded-full"
                  style={{
                    color: action.color,
                    background: `${action.color}15`,
                    border: `1px solid ${action.color}33`,
                  }}
                >
                  {action.cost}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "🤖",
            title: "Smart AI Chat",
            desc: "Context-aware conversation with JARVIS using natural language",
            color: "#00dcff",
          },
          {
            icon: "🎮",
            title: "16 Mini Games",
            desc: "Arcade, puzzle, memory, and skill games with leaderboards",
            color: "#44ff88",
          },
          {
            icon: "🎨",
            title: "AI Artistry",
            desc: "Generate images in 15 unique styles from cyberpunk to impressionist",
            color: "#aa44ff",
          },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-4 rounded-xl glow-border bg-navy-mid/20"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
