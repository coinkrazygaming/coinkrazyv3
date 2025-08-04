import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Gift,
  MessageCircle,
  Bot,
  Zap,
  Crown,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { tickerService, TickerMessage } from "@/services/tickerService";

interface TickerDisplayProps {
  className?: string;
}

const TickerDisplay: React.FC<TickerDisplayProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Subscribe to ticker updates
    const unsubscribe = tickerService.subscribeToTickers((newMessages) => {
      setMessages(newMessages.slice(0, 6)); // Show only top 6 messages
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    // Auto-rotate through messages every 8 seconds
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const getMessageIcon = (
    type: TickerMessage["type"],
    source: TickerMessage["source"],
  ) => {
    switch (type) {
      case "win":
        return <Trophy className="w-4 h-4 text-gold-500" />;
      case "new_user":
        return <Users className="w-4 h-4 text-green-500" />;
      case "leaderboard":
        return <Crown className="w-4 h-4 text-purple-500" />;
      case "offer":
        return <Gift className="w-4 h-4 text-red-500" />;
      case "social":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "ai_status":
        return <Bot className="w-4 h-4 text-cyan-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSourceColor = (source: TickerMessage["source"]) => {
    switch (source) {
      case "LuckyAI":
        return "text-gold-400";
      case "JoseyAI":
        return "text-purple-400";
      case "SecurityAI":
        return "text-red-400";
      case "GameMakerAI":
        return "text-green-400";
      case "system":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityIndicator = (priority: TickerMessage["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        );
      case "high":
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
      case "medium":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case "low":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const formatMessageContent = (content: string) => {
    // Replace **text** with bold formatting
    return content.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-gold-400">$1</strong>',
    );
  };

  if (messages.length === 0) {
    return (
      <div
        className={`bg-gradient-to-r from-purple-900/20 via-purple-800/20 to-purple-900/20 border-b border-purple-500/20 ${className}`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Bot className="w-4 h-4 animate-pulse" />
              <span>Loading live updates...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMessage = messages[currentIndex];

  return (
    <div
      className={`bg-gradient-to-r from-purple-900/30 via-purple-800/30 to-purple-900/30 border-b border-purple-500/30 ${className}`}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Current Message Display */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              {getMessageIcon(currentMessage.type, currentMessage.source)}
              {getPriorityIndicator(currentMessage.priority)}
            </div>

            <div
              className={`flex-1 overflow-hidden transition-all duration-300 ${isAnimating ? "opacity-50 transform translate-x-2" : "opacity-100"}`}
            >
              <div
                className="text-sm text-white/90 truncate"
                dangerouslySetInnerHTML={{
                  __html: formatMessageContent(currentMessage.content),
                }}
              />
            </div>

            <Badge
              variant="outline"
              className={`text-xs px-2 py-1 ${getSourceColor(currentMessage.source)} border-current/30`}
            >
              {currentMessage.source}
            </Badge>
          </div>

          {/* Message Navigation */}
          <div className="flex items-center gap-3 ml-4">
            {/* Progress Indicators */}
            <div className="flex items-center gap-1">
              {messages.slice(0, 6).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-purple-400 scale-125"
                      : "bg-purple-600/50 hover:bg-purple-500/70"
                  }`}
                />
              ))}
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-purple-300 hidden sm:inline">
                LIVE
              </span>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 text-xs text-purple-300">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>
                  {messages.filter((m) => m.type === "win").length} wins
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>
                  {messages.filter((m) => m.type === "new_user").length} new
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                <span>
                  {messages.filter((m) => m.type === "offer").length} offers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Ticker for Multiple Messages */}
        {messages.length > 1 && (
          <div className="mt-1 pt-1 border-t border-purple-500/20">
            <div className="flex items-center gap-6 overflow-hidden">
              <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
                {messages.slice(1, 4).map((message, index) => (
                  <div
                    key={message.id}
                    className="flex items-center gap-2 text-xs text-purple-200/80"
                  >
                    {getMessageIcon(message.type, message.source)}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessageContent(message.content),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TickerDisplay;
