import { Sidebar } from "@/components/layout/Sidebar";
import { ChatSection } from "@/components/sections/ChatSection";
import { GamesHub } from "@/components/sections/GamesHub";
import { HomeSection } from "@/components/sections/HomeSection";
import { ImageGenerator } from "@/components/sections/ImageGenerator";
import { LoginPage } from "@/components/sections/LoginPage";
import { ProfileSection } from "@/components/sections/ProfileSection";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useRegisterUser, useResetMonthlyTokens } from "@/hooks/useQueries";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Section = "home" | "chat" | "image" | "games" | "profile";

const SECTION_TITLES: Record<Section, string> = {
  home: "Dashboard",
  chat: "JARVIS Talk",
  image: "Image Generator",
  games: "Games Hub",
  profile: "Profile",
};

function ScanLine() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute w-full h-px opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,220,255,0.6), transparent)",
          animation: "scan 6s linear infinite",
        }}
      />
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const registerUser = useRegisterUser();
  const resetTokens = useResetMonthlyTokens();
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const registerMutate = registerUser.mutateAsync;
  const resetMutate = resetTokens.mutateAsync;

  // Register and reset tokens on login
  useEffect(() => {
    if (identity && actor && !isFetching && !initialized) {
      setInitialized(true);
      void (async () => {
        try {
          await registerMutate();
        } catch {
          // Already registered, that's fine
        }
        try {
          await resetMutate();
        } catch {
          // Reset failed silently
        }
      })();
    }
  }, [identity, actor, isFetching, initialized, registerMutate, resetMutate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center holo-grid">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-DEFAULT/30 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border border-cyan-DEFAULT/50 ring-counter-rotate" />
            <div className="absolute inset-8 rounded-full bg-cyan-DEFAULT/10 animate-pulse-glow flex items-center justify-center">
              <img
                src="/assets/generated/jarvis-logo-transparent.dim_120x120.png"
                alt="J"
                className="w-8 h-8"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-lg gradient-text">
              JARVIS AI Hub
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1 animate-pulse">
              Initializing systems...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const navigate = (section: string) => {
    setActiveSection(section as Section);
    setSidebarOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection onNavigate={navigate} />;
      case "chat":
        return <ChatSection />;
      case "image":
        return <ImageGenerator />;
      case "games":
        return <GamesHub />;
      case "profile":
        return <ProfileSection />;
      default:
        return <HomeSection onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background hex-pattern">
      <ScanLine />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.022 255)",
            border: "1px solid rgba(0,220,255,0.25)",
            color: "oklch(0.95 0.02 200)",
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-cyan-DEFAULT/15 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              className="lg:hidden w-9 h-9 rounded-lg border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT hover:bg-cyan-DEFAULT/10 transition-all"
              data-ocid="nav.menu.button"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
            <div>
              <h1 className="font-display font-semibold text-foreground text-sm sm:text-base">
                {SECTION_TITLES[activeSection]}
              </h1>
              <p className="text-xs text-cyan-DEFAULT/60 font-mono hidden sm:block">
                JARVIS AI Hub
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="hidden sm:inline">Systems Online</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" data-ocid="main.section">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={activeSection === "chat" ? "h-full flex flex-col" : ""}
              style={
                activeSection === "chat" ? { height: "calc(100vh - 57px)" } : {}
              }
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
