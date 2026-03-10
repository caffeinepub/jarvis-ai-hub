import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useUserProfile } from "@/hooks/useQueries";
import {
  Crown,
  Gamepad2,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "JARVIS Talk", icon: MessageSquare },
  { id: "image", label: "Image Gen", icon: Sparkles },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "profile", label: "Profile", icon: User },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  activeSection,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const isPremium = profile?.tier === "premium";
  const tokenBalance = profile ? Number(profile.tokenBalance) : 0;
  const maxTokens = isPremium ? 500 : 100;
  const tokenPercent = Math.min((tokenBalance / maxTokens) * 100, 100);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden cursor-default"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64
          bg-navy-dark border-r border-cyan-DEFAULT/15
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ boxShadow: "4px 0 30px rgba(0,220,255,0.06)" }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-cyan-DEFAULT/15">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-DEFAULT/40 bg-cyan-DEFAULT/10"
              style={{ boxShadow: "0 0 15px rgba(0,220,255,0.3)" }}
            >
              <img
                src="/assets/generated/jarvis-logo-transparent.dim_120x120.png"
                alt="J"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <p className="font-display font-bold text-foreground gradient-text">
                JARVIS
              </p>
              <p className="text-xs text-cyan-DEFAULT/70 font-mono">
                AI Hub v2.0
              </p>
            </div>
          </div>
        </div>

        {/* Token Display */}
        {identity && (
          <div className="px-4 py-3 border-b border-cyan-DEFAULT/10">
            <div className="p-3 rounded-xl bg-navy-mid/50 border border-cyan-DEFAULT/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-DEFAULT" />
                  <span className="text-xs font-medium text-foreground">
                    Tokens
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isPremium && <Crown className="w-3 h-3 text-yellow-400" />}
                  <span
                    className={`text-xs font-mono font-bold ${tokenBalance < 20 ? "text-red-400" : "text-cyan-DEFAULT"}`}
                  >
                    {tokenBalance}/{maxTokens}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-navy-dark overflow-hidden">
                <div
                  className="h-full rounded-full token-bar transition-all duration-700"
                  style={{ width: `${tokenPercent}%` }}
                />
              </div>
              {isPremium && (
                <p className="text-xs text-yellow-400/70 mt-1.5 font-mono">
                  Premium Member
                </p>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-DEFAULT/15 text-cyan-DEFAULT border border-cyan-DEFAULT/30"
                    : "text-muted-foreground hover:bg-navy-mid/50 hover:text-foreground border border-transparent"
                }`}
                style={
                  isActive ? { boxShadow: "0 0 12px rgba(0,220,255,0.2)" } : {}
                }
                data-ocid={`nav.${item.id}.link`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-cyan-DEFAULT" : ""}`}
                />
                {item.label}
                {item.id === "games" && (
                  <span className="ml-auto text-xs opacity-60 font-mono">
                    16
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="p-4 border-t border-cyan-DEFAULT/15">
          {identity ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono truncate px-1">
                {identity.getPrincipal().toString().slice(0, 20)}...
              </p>
              <Button
                onClick={clear}
                variant="outline"
                className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10 text-sm"
                data-ocid="nav.logout.button"
              >
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30"
              data-ocid="nav.login.button"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cyan-DEFAULT/40 border-t-cyan-DEFAULT rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Log In
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground/50 text-center font-mono">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-DEFAULT/60 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}
