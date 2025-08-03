import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Brain,
  Activity,
  FileText,
  CreditCard,
  Settings,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  priority?: "low" | "medium" | "high" | "critical";
}

interface Alert {
  id: string;
  type: "fraud" | "rtp" | "system" | "support";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  status: "active" | "investigating" | "resolved";
  user?: string;
  game?: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm Lucky, your AI assistant. I'm monitoring the platform 24/7 for fraud, unusual patterns, and system issues. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "fraud",
      title: "Suspicious Betting Pattern",
      description:
        'User "casinofan" showing unusual betting patterns. 47 consecutive losses followed by large win.',
      priority: "high",
      timestamp: "2024-03-20T14:30:00Z",
      status: "active",
      user: "casinofan",
      game: "Sweet Bonanza",
    },
    {
      id: "2",
      type: "rtp",
      title: "RTP Anomaly Detected",
      description:
        "Sweet Bonanza RTP deviation: 102.3% over last 1000 spins (expected: 96.48%)",
      priority: "medium",
      timestamp: "2024-03-20T14:15:00Z",
      status: "investigating",
      game: "Sweet Bonanza",
    },
    {
      id: "3",
      type: "system",
      title: "High Database Load",
      description:
        "Database response time increased by 300%. Investigating potential cause.",
      priority: "medium",
      timestamp: "2024-03-20T14:00:00Z",
      status: "investigating",
    },
    {
      id: "4",
      type: "support",
      title: "Auto-Resolved Tickets",
      description:
        "Successfully resolved 12 password reset requests and 3 bonus claim inquiries automatically.",
      priority: "low",
      timestamp: "2024-03-20T13:45:00Z",
      status: "resolved",
    },
  ]);

  const [liveMetrics, setLiveMetrics] = useState({
    fraudScore: 2.3,
    systemHealth: 97.8,
    activeUsers: 2847,
    supportTickets: 12,
    rtpCompliance: 98.9,
    autoResolvedToday: 45,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        ...prev,
        fraudScore: Math.max(
          0,
          Math.min(10, prev.fraudScore + (Math.random() - 0.5) * 0.5),
        ),
        systemHealth: Math.max(
          90,
          Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2),
        ),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
        supportTickets: Math.max(
          0,
          prev.supportTickets + Math.floor(Math.random() * 3) - 1,
        ),
        autoResolvedToday:
          prev.autoResolvedToday + Math.floor(Math.random() * 2),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateAIResponse(currentMessage),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("fraud") || input.includes("suspicious")) {
      return "I've detected 3 potential fraud alerts in the last hour. User 'casinofan' shows unusual betting patterns. I recommend reviewing their account and potentially flagging for manual review. Would you like me to generate a detailed fraud report?";
    }

    if (input.includes("rtp") || input.includes("game")) {
      return "Current RTP compliance is at 98.9%. Sweet Bonanza is showing a slight deviation (102.3% vs expected 96.48%) over the last 1000 spins. This is within acceptable variance but I'm monitoring closely. Should I adjust the RTP parameters?";
    }

    if (input.includes("system") || input.includes("performance")) {
      return `System health is at ${liveMetrics.systemHealth.toFixed(1)}%. Database response times are slightly elevated. I've automatically scaled up server resources and the issue should resolve in 10-15 minutes. No user impact detected.`;
    }

    if (input.includes("support") || input.includes("tickets")) {
      return `I've auto-resolved ${liveMetrics.autoResolvedToday} support tickets today, including password resets, bonus claims, and general inquiries. Currently ${liveMetrics.supportTickets} tickets require human attention. Would you like me to prioritize them by urgency?`;
    }

    return "I'm here to help with fraud detection, system monitoring, RTP compliance, and support automation. What specific area would you like me to analyze or assist with?";
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        setCurrentMessage("Check fraud alerts for user casinofan");
      }, 3000);
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved" } : alert,
      ),
    );
  };

  const investigateAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "investigating" } : alert,
      ),
    );
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black shadow-lg shadow-gold-500/25"
        >
          <Bot className="w-6 h-6" />
        </Button>
        {/* Alert indicator */}
        {alerts.filter((a) => a.status === "active").length > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            {alerts.filter((a) => a.status === "active").length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-gold/10 to-casino-blue/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-bold">Lucky AI Assistant</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">
                  Online & Monitoring
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleVoiceToggle}
              className={isVoiceMode ? "bg-red-500 text-white" : ""}
            >
              {isListening ? (
                <Mic className="w-3 h-3 animate-pulse" />
              ) : (
                <MicOff className="w-3 h-3" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="p-3 border-b border-border bg-muted/20">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div
              className={`font-bold ${liveMetrics.fraudScore > 5 ? "text-red-500" : liveMetrics.fraudScore > 3 ? "text-orange-500" : "text-green-500"}`}
            >
              {liveMetrics.fraudScore.toFixed(1)}
            </div>
            <div className="text-muted-foreground">Fraud Score</div>
          </div>
          <div className="text-center">
            <div
              className={`font-bold ${liveMetrics.systemHealth < 95 ? "text-red-500" : liveMetrics.systemHealth < 98 ? "text-orange-500" : "text-green-500"}`}
            >
              {liveMetrics.systemHealth.toFixed(1)}%
            </div>
            <div className="text-muted-foreground">System Health</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-casino-blue">
              {liveMetrics.activeUsers}
            </div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="p-3 border-b border-border max-h-32 overflow-y-auto">
        <h4 className="font-bold text-xs mb-2">Active Alerts</h4>
        <div className="space-y-1">
          {alerts
            .filter((a) => a.status === "active")
            .slice(0, 2)
            .map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/20 rounded text-xs"
              >
                <div className="flex-1">
                  <div className="font-medium text-red-400">{alert.title}</div>
                  <div className="text-muted-foreground truncate">
                    {alert.description}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => investigateAlert(alert.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg text-sm ${
                message.type === "user"
                  ? "bg-gold-500 text-black"
                  : message.type === "system"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-muted"
              }`}
            >
              {message.type === "assistant" && (
                <div className="flex items-center gap-1 mb-1">
                  <Brain className="w-3 h-3 text-gold-500" />
                  <span className="text-xs font-medium text-gold-500">
                    Lucky
                  </span>
                </div>
              )}
              {message.content}
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder={
              isListening
                ? "Listening..."
                : "Ask Lucky about fraud, RTP, or system status..."
            }
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isListening}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isListening}
            className="bg-gold-500 hover:bg-gold-600 text-black"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>

        {isVoiceMode && (
          <div className="text-xs text-center mt-2 text-muted-foreground">
            {isListening ? "🎤 Listening... Speak now" : "Voice mode enabled"}
          </div>
        )}
      </div>
    </div>
  );
}
