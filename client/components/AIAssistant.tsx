import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { luckyAiService, AIMessage, VMInstance } from "@/services/luckyAiService";
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
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Play,
  Square,
  RotateCcw,
  Loader2,
  Terminal,
} from "lucide-react";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [vmInstances, setVmInstances] = useState<VMInstance[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data and subscribe to updates
  useEffect(() => {
    const chatHistory = luckyAiService.getChatHistory();
    setMessages(chatHistory);
    setVmInstances(luckyAiService.getVMInstances());

    // Subscribe to chat updates
    const unsubscribe = luckyAiService.subscribeToChatUpdates((newMessages) => {
      setMessages(newMessages);
    });

    // Update VM instances periodically
    const vmInterval = setInterval(() => {
      setVmInstances(luckyAiService.getVMInstances());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(vmInterval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    setIsTyping(true);
    setCurrentMessage("");

    try {
      await luckyAiService.sendMessage(currentMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        setCurrentMessage("Show me VM status");
      }, 3000);
    }
  };

  const handleVMAction = async (vmId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      if (action === 'start') {
        await luckyAiService.startVM(vmId);
      } else if (action === 'stop') {
        await luckyAiService.stopVM(vmId);
      } else if (action === 'restart') {
        await luckyAiService.stopVM(vmId);
        setTimeout(() => luckyAiService.startVM(vmId), 3000);
      }
    } catch (error) {
      console.error(`Failed to ${action} VM:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'stopped': return 'text-red-500';
      case 'starting': return 'text-yellow-500';
      case 'stopping': return 'text-orange-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getResourceColor = (usage: number) => {
    if (usage > 80) return 'text-red-500';
    if (usage > 60) return 'text-yellow-500';
    return 'text-green-500';
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
        {/* Activity indicator */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[480px] h-[700px] bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-gold/10 to-casino-blue/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg">LuckyAI Assistant</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">
                  Online & VM Management Active
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="vm">
            <Server className="w-4 h-4 mr-2" />
            VM Manager
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Activity className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
          {/* Live Performance Metrics */}
          <div className="p-3 border-b border-border bg-muted/20">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-green-500">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-casino-blue">
                  {vmInstances.filter(vm => vm.status === 'running').length}/{vmInstances.length}
                </div>
                <div className="text-muted-foreground">VMs Active</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gold-500">
                  {Math.round(vmInstances.reduce((sum, vm) => sum + vm.cpu, 0) / vmInstances.length)}%
                </div>
                <div className="text-muted-foreground">Avg CPU</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-500">97.8</div>
                <div className="text-muted-foreground">AI Score</div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-gold-500 text-black"
                      : message.role === "system"
                        ? "bg-red-500/10 border border-red-500/20 text-red-400"
                        : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-gold-500" />
                      <span className="text-sm font-medium text-gold-500">
                        LuckyAI
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-lg text-sm bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-gold-500" />
                    <span className="text-sm font-medium text-gold-500">
                      LuckyAI
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder={
                  isListening
                    ? "Listening..."
                    : "Ask about VM status, system health, or any casino operations..."
                }
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isListening || isTyping}
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isListening || isTyping}
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
        </TabsContent>

        {/* VM Manager Tab */}
        <TabsContent value="vm" className="flex-1 overflow-y-auto m-0 p-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Virtual Machine Manager</h4>
              <Badge variant="outline" className="text-green-500 border-green-500">
                {vmInstances.filter(vm => vm.status === 'running').length} Running
              </Badge>
            </div>

            {vmInstances.map((vm) => (
              <Card key={vm.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">{vm.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{vm.purpose}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(vm.status)}
                    >
                      {vm.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Resource Usage */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="text-center">
                      <div className={`font-bold ${getResourceColor(vm.cpu)}`}>
                        {vm.cpu}%
                      </div>
                      <div className="text-muted-foreground flex items-center justify-center gap-1">
                        <Cpu className="w-3 h-3" />
                        CPU
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${getResourceColor(vm.memory)}`}>
                        {vm.memory}%
                      </div>
                      <div className="text-muted-foreground flex items-center justify-center gap-1">
                        <MemoryStick className="w-3 h-3" />
                        RAM
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${getResourceColor(vm.disk)}`}>
                        {vm.disk}%
                      </div>
                      <div className="text-muted-foreground flex items-center justify-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        Disk
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVMAction(vm.id, 'start')}
                        disabled={vm.status === 'running' || vm.status === 'starting'}
                        className="h-6 px-2"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVMAction(vm.id, 'stop')}
                        disabled={vm.status === 'stopped' || vm.status === 'stopping'}
                        className="h-6 px-2"
                      >
                        <Square className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVMAction(vm.id, 'restart')}
                        disabled={vm.status !== 'running'}
                        className="h-6 px-2"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Active: {vm.lastActivity.toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Recent Logs */}
                  <div className="bg-muted/20 rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Terminal className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Recent Activity</span>
                    </div>
                    <div className="space-y-1">
                      {vm.logs.slice(0, 2).map((log, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          • {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="flex-1 overflow-y-auto m-0 p-3">
          <div className="space-y-4">
            <h4 className="font-bold">AI Performance Metrics</h4>
            
            {/* Capabilities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">AI Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {luckyAiService.getCapabilities().map((capability) => (
                    <div key={capability.id} className="flex items-center justify-between">
                      <span className="text-sm">{capability.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {capability.performance.toFixed(1)}%
                        </span>
                        <Badge 
                          variant={capability.enabled ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {capability.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total VMs</div>
                    <div className="font-bold">{vmInstances.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Running VMs</div>
                    <div className="font-bold text-green-500">
                      {vmInstances.filter(vm => vm.status === 'running').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg CPU</div>
                    <div className="font-bold">
                      {Math.round(vmInstances.reduce((sum, vm) => sum + vm.cpu, 0) / vmInstances.length)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Memory</div>
                    <div className="font-bold">
                      {Math.round(vmInstances.reduce((sum, vm) => sum + vm.memory, 0) / vmInstances.length)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent AI Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>VM health check completed</span>
                    <span className="text-muted-foreground ml-auto">2m ago</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span>Resource optimization applied</span>
                    <span className="text-muted-foreground ml-auto">5m ago</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-gold-500" />
                    <span>Security scan completed</span>
                    <span className="text-muted-foreground ml-auto">8m ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
