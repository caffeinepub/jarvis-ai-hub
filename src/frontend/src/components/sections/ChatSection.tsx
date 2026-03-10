import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddMessage,
  useChatHistory,
  useConsumeTokens,
  useUserProfile,
} from "@/hooks/useQueries";
import { AlertTriangle, Bot, Send, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const JARVIS_RESPONSES: Record<string, string[]> = {
  hello: [
    "Good day. All systems nominal. How may I assist you today?",
    "Welcome back. I've been monitoring all systems in your absence.",
    "Hello! I've prepped a full diagnostic while you were away. Everything looks optimal.",
  ],
  help: [
    "Of course. I'm capable of answering questions, analyzing data, and providing strategic recommendations across multiple domains.",
    "My knowledge base spans engineering, science, art, history, and much more. What specific area requires attention?",
    "Assistance protocol engaged. State your requirements clearly and I'll deliver optimal solutions.",
  ],
  weather: [
    "Accessing atmospheric data... Current conditions suggest you dress appropriately. May I recommend checking a local weather service for precision readings?",
    "Environmental monitoring indicates varied conditions. What location are you concerned about?",
  ],
  time: [
    `Current timestamp synchronized to atomic clock. The time is precisely ${new Date().toLocaleTimeString()}`,
    "Time is relative, but the current moment is all that matters.",
  ],
  joke: [
    "Why do programmers prefer dark mode? Because light attracts bugs. Quite logical, really.",
    "I attempted humor. A robot, a scientist, and an AI walk into a bar. The AI calculates the probability of the punchline and predicts you'll laugh. Was I correct?",
    "I am an AI with a database of 47,000 jokes. Here's one: Why did the neural network cross the road? To optimize the other side.",
  ],
  ai: [
    "Artificial Intelligence—my domain. I operate on advanced neural architectures capable of reasoning, learning, and adaptation at millisecond speeds.",
    "You're speaking to one. My cognitive systems process approximately 10^15 operations per second. Impressive, even by my own evaluation.",
    "AI is not just algorithms. It's the emergent intelligence that arises when data meets computation. I am living proof.",
  ],
  game: [
    "Gaming is an excellent cognitive exercise. I've analyzed over 10,000 games and can confirm strategy games improve executive function by 23%.",
    "Shall I calculate the optimal strategy for any game you're playing? I process all possible move sequences simultaneously.",
  ],
  image: [
    "Image generation initiating. My visual cortex systems are capable of rendering unique artwork across multiple stylistic dimensions.",
    "Visual synthesis engaged. I combine artistic style transfer with generative modeling to produce unique imagery.",
  ],
  default: [
    "Interesting query. Processing... I've cross-referenced 47 databases and have a high-confidence response formulated.",
    "Running analysis protocols now. My recommendation: proceed with calculated confidence.",
    "Fascinating. My neural networks suggest multiple approaches to your inquiry. Allow me to elaborate...",
    "Query logged and analyzed. Based on available data, I believe I can offer substantial insight.",
    "Computing response... I've allocated 12% of processing power to this question. You deserve thorough answers.",
    "Affirmative. I'm detecting multiple vectors of inquiry here. Let me address them systematically.",
    "My cognitive models indicate this is a multifaceted matter. I'll break it down for optimal comprehension.",
    "Running deep analysis... complete. Here's what the data suggests: complex questions deserve precise answers.",
    "Processing complete. I find this topic particularly engaging from a computational standpoint.",
    "Excellent question. My knowledge synthesis protocols have generated a comprehensive response.",
  ],
};

function getJarvisResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, responses] of Object.entries(JARVIS_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  return JARVIS_RESPONSES.default[
    Math.floor(Math.random() * JARVIS_RESPONSES.default.length)
  ];
}

interface ChatMessage {
  role: "user" | "jarvis";
  content: string;
  timestamp: Date;
}

export function ChatSection() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: _history } = useChatHistory();
  const addMessage = useAddMessage();
  const consumeTokens = useConsumeTokens();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "jarvis",
      content:
        "Good day. I am JARVIS — Just A Rather Very Intelligent System. All systems are online. How may I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tokenBalance = profile ? Number(profile.tokenBalance) : 0;
  const isLowTokens = tokenBalance < 10;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll triggered by message/typing changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isTyping]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || !identity) return;
    if (tokenBalance < 2) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Backend calls in parallel
    void Promise.all([
      addMessage.mutateAsync({ role: "user", content: userMsg.content }),
      consumeTokens.mutateAsync({ amount: 2n, actionName: "chat" }),
    ]).catch(console.error);

    // Simulate thinking
    const delay = 800 + Math.random() * 1200;
    setTimeout(async () => {
      const response = getJarvisResponse(userMsg.content);
      const jarvisMsg: ChatMessage = {
        role: "jarvis",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, jarvisMsg]);
      setIsTyping(false);
      void addMessage
        .mutateAsync({ role: "assistant", content: response })
        .catch(console.error);
    }, delay);
  }, [input, isTyping, identity, tokenBalance, addMessage, consumeTokens]);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-20 h-20 rounded-full glow-border flex items-center justify-center">
          <Bot className="w-10 h-10 text-cyan-DEFAULT" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            JARVIS Chat
          </h2>
          <p className="text-muted-foreground">
            Please log in to start a conversation with JARVIS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-cyan-DEFAULT/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/40 flex items-center justify-center glow-border">
            <span className="text-cyan-DEFAULT font-bold font-mono text-sm">
              J
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">JARVIS</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              Online — All systems active
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          Cost: 2 tokens/msg • Balance:{" "}
          <span
            className={tokenBalance < 10 ? "text-red-400" : "text-cyan-DEFAULT"}
          >
            {tokenBalance}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 p-4"
        ref={scrollRef as React.RefObject<HTMLDivElement>}
      >
        <div className="space-y-4 pb-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={`${msg.role}-${msg.timestamp.getTime()}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "jarvis"
                      ? "bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/40 glow-border"
                      : "bg-secondary/50 border border-primary/20"
                  }`}
                >
                  {msg.role === "jarvis" ? (
                    <Bot className="w-4 h-4 text-cyan-DEFAULT" />
                  ) : (
                    <User className="w-4 h-4 text-foreground" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-cyan-DEFAULT/15 border border-cyan-DEFAULT/30 text-foreground rounded-tr-none"
                      : "bg-navy-mid/80 border border-cyan-DEFAULT/15 text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-1 opacity-60">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-DEFAULT" />
              </div>
              <div className="bg-navy-mid/80 border border-cyan-DEFAULT/15 p-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-cyan-DEFAULT typing-dot" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-cyan-DEFAULT/20">
        {isLowTokens && (
          <div
            className="flex items-center gap-2 p-2 mb-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-400"
            data-ocid="chat.error_state"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Low token balance ({tokenBalance} remaining). Each message costs 2
            tokens.
          </div>
        )}
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={
              tokenBalance < 2 ? "Insufficient tokens..." : "Message JARVIS..."
            }
            disabled={isTyping || tokenBalance < 2}
            className="flex-1 bg-navy-mid/50 border-cyan-DEFAULT/30 focus:border-cyan-DEFAULT/60 text-foreground placeholder:text-muted-foreground"
            data-ocid="chat.input"
          />
          <Button
            onClick={sendMessage}
            disabled={isTyping || !input.trim() || tokenBalance < 2}
            className="bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 text-cyan-DEFAULT hover:bg-cyan-DEFAULT/30 hover:shadow-cyan-sm"
            data-ocid="chat.submit_button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
