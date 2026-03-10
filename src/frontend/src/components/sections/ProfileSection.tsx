import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useChatHistory,
  useImageHistory,
  useUpgradeToPremium,
  useUserProfile,
} from "@/hooks/useQueries";
import {
  Crown,
  Image,
  MessageSquare,
  Shield,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileSection() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useUserProfile();
  const { data: imageHistory } = useImageHistory();
  const { data: chatHistory } = useChatHistory();
  const upgradeToPremium = useUpgradeToPremium();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <Shield className="w-16 h-16 text-cyan-DEFAULT" />
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold mb-2">Profile</h2>
          <p className="text-muted-foreground">Log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-ocid="profile.loading_state"
      >
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
          <div className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
          <div className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
        </div>
      </div>
    );
  }

  const isPremium = profile?.tier === "premium";
  const maxTokens = isPremium ? 500 : 100;
  const tokenBalance = profile ? Number(profile.tokenBalance) : 0;
  const tokenPercent = Math.min((tokenBalance / maxTokens) * 100, 100);

  const memberSince = profile?.created
    ? new Date(Number(profile.created) / 1_000_000).toLocaleDateString()
    : "N/A";

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium.mutateAsync();
      setShowUpgradeModal(false);
      toast.success("Welcome to Premium! Enjoy 500 tokens/month.");
    } catch {
      toast.error("Upgrade failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-6 rounded-2xl glow-border bg-navy-mid/40"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-mono border-2 border-cyan-DEFAULT/50 glow-border"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,220,255,0.15), rgba(0,100,200,0.1))",
          }}
        >
          {identity.getPrincipal().toString().slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <p className="font-display font-semibold text-lg text-foreground">
              User Profile
            </p>
            {isPremium ? (
              <Badge className="premium-gradient text-white border-0 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Premium
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-cyan-DEFAULT/40 text-cyan-DEFAULT"
              >
                Free
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {identity.getPrincipal().toString().slice(0, 32)}...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Member since {memberSince}
          </p>
        </div>
      </motion.div>

      {/* Token Balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-xl glow-border bg-navy-mid/30"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-DEFAULT" />
            <span className="font-medium text-foreground">Token Balance</span>
          </div>
          <span
            className={`font-mono font-bold text-lg ${tokenBalance < 20 ? "text-red-400" : "text-cyan-DEFAULT"}`}
          >
            {tokenBalance} / {maxTokens}
          </span>
        </div>
        <div className="relative h-3 rounded-full bg-navy-dark overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tokenPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full token-bar"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{tokenBalance} remaining</span>
          <span>{isPremium ? "Premium: 500/mo" : "Free: 100/mo"}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Messages Sent",
            value: chatHistory?.filter((m) => m.role === "user").length || 0,
            icon: <MessageSquare className="w-4 h-4 text-cyan-DEFAULT" />,
            color: "text-cyan-DEFAULT",
          },
          {
            label: "Images Generated",
            value: imageHistory?.length || 0,
            icon: <Image className="w-4 h-4 text-purple-400" />,
            color: "text-purple-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="p-4 rounded-xl glow-border bg-navy-mid/30 text-center"
          >
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Image History */}
      {imageHistory && imageHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Image className="w-4 h-4 text-purple-400" /> Image History
          </h3>
          <div className="space-y-2">
            {imageHistory.slice(0, 5).map((req, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: history item positions are stable
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-navy-mid/30 border border-cyan-DEFAULT/10"
              >
                <span className="text-lg">🎨</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {req.prompt}
                  </p>
                  <p className="text-xs text-muted-foreground">{req.style}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Upgrade */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-xl border border-yellow-400/30 bg-yellow-400/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-foreground">
              Upgrade to Premium
            </h3>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground mb-4">
            <li className="flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-400" /> 500 tokens/month (5×
              more)
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-400" /> Priority JARVIS
              responses
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-400" /> Unlimited game access
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-400" /> Premium badge
            </li>
          </ul>
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full premium-gradient text-white border-0 hover:opacity-90"
            data-ocid="profile.primary_button"
          >
            <Crown className="w-4 h-4 mr-2" /> Upgrade to Premium
          </Button>
        </motion.div>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent
          className="bg-navy-dark border-yellow-400/30 max-w-sm"
          data-ocid="profile.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Crown className="w-5 h-5 text-yellow-400" /> Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-navy-mid/50 border border-cyan-DEFAULT/20">
                <p className="font-semibold text-foreground mb-2">Free</p>
                <p className="text-muted-foreground">100 tokens/mo</p>
                <p className="text-muted-foreground">Standard access</p>
              </div>
              <div className="p-3 rounded-lg border border-yellow-400/40 bg-yellow-400/5">
                <p className="font-semibold text-yellow-400 mb-2 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium
                </p>
                <p className="text-foreground">500 tokens/mo</p>
                <p className="text-foreground">Priority access</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="border-cyan-DEFAULT/30"
              data-ocid="profile.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={upgradeToPremium.isPending}
              className="premium-gradient text-white border-0"
              data-ocid="profile.confirm_button"
            >
              {upgradeToPremium.isPending ? "Upgrading..." : "Confirm Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
