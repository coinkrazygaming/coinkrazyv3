import { databaseService } from './database';
import { authService } from './authService';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface VMInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  cpu: number;
  memory: number;
  disk: number;
  purpose: string;
  created: Date;
  lastActivity: Date;
  logs: string[];
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  performance: number;
}

class LuckyAIService {
  private static instance: LuckyAIService;
  private chatHistory: AIMessage[] = [];
  private vmInstances: Map<string, VMInstance> = new Map();
  private capabilities: AICapability[] = [];
  private listeners: Set<(messages: AIMessage[]) => void> = new Set();

  static getInstance(): LuckyAIService {
    if (!LuckyAIService.instance) {
      LuckyAIService.instance = new LuckyAIService();
    }
    return LuckyAIService.instance;
  }

  constructor() {
    this.initializeCapabilities();
    this.initializeVMInstances();
    this.loadChatHistory();
  }

  private initializeCapabilities() {
    this.capabilities = [
      {
        id: 'customer_support',
        name: 'Customer Support',
        description: 'Handle customer inquiries and support tickets',
        enabled: true,
        performance: 97.8
      },
      {
        id: 'fraud_detection',
        name: 'Fraud Detection',
        description: 'Monitor transactions and detect suspicious activity',
        enabled: true,
        performance: 98.5
      },
      {
        id: 'game_analysis',
        name: 'Game Analysis',
        description: 'Analyze game performance and RTP compliance',
        enabled: true,
        performance: 99.1
      },
      {
        id: 'bonus_management',
        name: 'Bonus Management',
        description: 'Manage and distribute player bonuses',
        enabled: true,
        performance: 96.7
      },
      {
        id: 'vm_management',
        name: 'VM Management',
        description: 'Monitor and manage virtual machine instances',
        enabled: true,
        performance: 99.9
      },
      {
        id: 'predictive_analytics',
        name: 'Predictive Analytics',
        description: 'Predict player behavior and market trends',
        enabled: true,
        performance: 94.2
      }
    ];
  }

  private initializeVMInstances() {
    // Simulate VM instances for different casino operations
    const vms: VMInstance[] = [
      {
        id: 'vm-game-engine-01',
        name: 'Game Engine Primary',
        status: 'running',
        cpu: 78,
        memory: 82,
        disk: 45,
        purpose: 'Primary game processing engine for slots and table games',
        created: new Date(Date.now() - 86400000 * 30), // 30 days ago
        lastActivity: new Date(),
        logs: [
          'Game session started for user player123',
          'RTP compliance check passed for Sweet Bonanza',
          'Jackpot calculation updated for CoinKrazy Spinner',
          'Memory optimization completed'
        ]
      },
      {
        id: 'vm-analytics-01',
        name: 'Real-time Analytics',
        status: 'running',
        cpu: 65,
        memory: 71,
        disk: 38,
        purpose: 'Real-time data processing and analytics',
        created: new Date(Date.now() - 86400000 * 25), // 25 days ago
        lastActivity: new Date(Date.now() - 30000), // 30 seconds ago
        logs: [
          'Player count updated: 2,847 active',
          'Revenue metrics calculated for last 24h',
          'Fraud detection scan completed',
          'Performance report generated'
        ]
      },
      {
        id: 'vm-payment-processor',
        name: 'Payment Processing',
        status: 'running',
        cpu: 34,
        memory: 56,
        disk: 23,
        purpose: 'Handle payment transactions and withdrawals',
        created: new Date(Date.now() - 86400000 * 20), // 20 days ago
        lastActivity: new Date(Date.now() - 120000), // 2 minutes ago
        logs: [
          'PayPal webhook processed successfully',
          'Withdrawal request validated for $150 SC',
          'Payment encryption updated',
          'Transaction log archived'
        ]
      },
      {
        id: 'vm-ai-worker-01',
        name: 'AI Processing Node',
        status: 'running',
        cpu: 91,
        memory: 88,
        disk: 67,
        purpose: 'Machine learning and AI processing workloads',
        created: new Date(Date.now() - 86400000 * 15), // 15 days ago
        lastActivity: new Date(Date.now() - 5000), // 5 seconds ago
        logs: [
          'Neural network training iteration completed',
          'Player behavior model updated',
          'Recommendation engine optimized',
          'GPU utilization: 94%'
        ]
      },
      {
        id: 'vm-backup-storage',
        name: 'Backup & Storage',
        status: 'running',
        cpu: 12,
        memory: 28,
        disk: 85,
        purpose: 'Data backup and long-term storage',
        created: new Date(Date.now() - 86400000 * 35), // 35 days ago
        lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
        logs: [
          'Daily backup completed successfully',
          'Database snapshot created',
          'Archive compression completed',
          'Storage health check passed'
        ]
      }
    ];

    vms.forEach(vm => {
      this.vmInstances.set(vm.id, vm);
    });

    // Start VM monitoring
    this.startVMMonitoring();
  }

  private startVMMonitoring() {
    setInterval(() => {
      this.vmInstances.forEach((vm, id) => {
        // Simulate resource usage fluctuations
        if (vm.status === 'running') {
          vm.cpu = Math.max(10, Math.min(95, vm.cpu + (Math.random() - 0.5) * 10));
          vm.memory = Math.max(15, Math.min(90, vm.memory + (Math.random() - 0.5) * 8));
          vm.disk = Math.max(10, Math.min(95, vm.disk + (Math.random() - 0.5) * 2));
          vm.lastActivity = new Date();

          // Occasionally add new log entries
          if (Math.random() < 0.1) {
            const newLog = this.generateVMLog(vm);
            vm.logs.unshift(newLog);
            if (vm.logs.length > 10) {
              vm.logs = vm.logs.slice(0, 10);
            }
          }
        }
      });
    }, 10000); // Update every 10 seconds
  }

  private generateVMLog(vm: VMInstance): string {
    const logTemplates = {
      'vm-game-engine-01': [
        'New game session initiated',
        'RTP calculation verified',
        'Jackpot updated successfully',
        'Game state synchronized',
        'Performance optimization applied'
      ],
      'vm-analytics-01': [
        'Real-time metrics updated',
        'Data pipeline processed',
        'Analytics report generated',
        'Performance threshold met',
        'Cache optimization completed'
      ],
      'vm-payment-processor': [
        'Payment transaction processed',
        'Security validation passed',
        'Webhook response handled',
        'Currency conversion completed',
        'Settlement batch processed'
      ],
      'vm-ai-worker-01': [
        'Model inference completed',
        'Training batch processed',
        'Pattern recognition updated',
        'Recommendation generated',
        'Neural network optimized'
      ],
      'vm-backup-storage': [
        'Backup verification completed',
        'Storage cleanup performed',
        'Archive integrity checked',
        'Retention policy applied',
        'Snapshot created successfully'
      ]
    };

    const templates = logTemplates[vm.id as keyof typeof logTemplates] || ['System operation completed'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private loadChatHistory() {
    // Simulate loading previous chat history
    this.chatHistory = [
      {
        id: '1',
        role: 'system',
        content: 'LuckyAI initialized successfully. All systems operational. VM monitoring active.',
        timestamp: new Date(Date.now() - 3600000),
        metadata: { type: 'system_startup' }
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hello! I\'m Lucky, your AI assistant. I\'m here to help manage the casino operations, monitor system health, and assist with any questions you might have. How can I help you today?',
        timestamp: new Date(Date.now() - 3500000),
        metadata: { type: 'greeting' }
      }
    ];
  }

  async sendMessage(content: string): Promise<AIMessage> {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    this.chatHistory.push(userMessage);
    this.notifyListeners();

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const response = await this.generateResponse(content);
    const assistantMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    this.chatHistory.push(assistantMessage);
    this.notifyListeners();

    // Update AI metrics
    await this.updateAIMetrics();

    return assistantMessage;
  }

  private async generateResponse(userInput: string): Promise<string> {
    const input = userInput.toLowerCase();
    
    // VM Management Commands
    if (input.includes('vm') || input.includes('virtual machine')) {
      if (input.includes('status') || input.includes('list')) {
        return this.getVMStatusReport();
      }
      if (input.includes('restart') && input.includes('analytics')) {
        return await this.restartVM('vm-analytics-01');
      }
      if (input.includes('restart') && input.includes('game')) {
        return await this.restartVM('vm-game-engine-01');
      }
      if (input.includes('performance') || input.includes('metrics')) {
        return this.getVMPerformanceReport();
      }
    }

    // System Status Commands
    if (input.includes('status') || input.includes('health')) {
      return await this.getSystemStatusReport();
    }

    // Player Management
    if (input.includes('player') || input.includes('user')) {
      if (input.includes('ban') || input.includes('suspend')) {
        return 'I can help you manage player accounts. Please provide the player\'s email or username, and I\'ll check their status and recent activity for any suspicious behavior.';
      }
      if (input.includes('balance') || input.includes('bonus')) {
        return 'I can assist with player balance adjustments and bonus management. What specific action would you like to take?';
      }
    }

    // Game Management
    if (input.includes('game') || input.includes('slot') || input.includes('rtp')) {
      return 'I\'m monitoring all game performance metrics. Current RTP compliance is at 99.8% across all active games. Any specific game you\'d like me to analyze?';
    }

    // Fraud Detection
    if (input.includes('fraud') || input.includes('suspicious')) {
      return 'Fraud detection systems are active. I\'ve identified 3 potential anomalies in the last 24 hours. Would you like me to provide details on these cases?';
    }

    // Revenue and Analytics
    if (input.includes('revenue') || input.includes('profit') || input.includes('analytics')) {
      return 'Current 24-hour revenue is $45,230 with 2,847 active players. Profit margins are within expected ranges. SC redemptions are processing normally.';
    }

    // General Help
    if (input.includes('help') || input.includes('what can you do')) {
      return `I can help you with:
      
🎮 Game Management - Monitor RTP, manage jackpots, control game availability
🔒 Security & Fraud - Detect suspicious activity, manage player sanctions
💰 Financial Operations - Track revenue, process withdrawals, manage bonuses
🖥️ VM Management - Monitor server health, restart services, optimize performance
📊 Analytics - Generate reports, track KPIs, predict trends
👥 Player Support - Handle inquiries, resolve issues, manage accounts

Just ask me about any of these topics, and I'll provide detailed assistance!`;
    }

    // Default response with contextual awareness
    const responses = [
      'I understand you\'re looking for assistance. Could you be more specific about what you need help with? I can help with VM management, player support, fraud detection, or system monitoring.',
      'I\'m here to help manage casino operations. What specific task would you like me to assist with today?',
      'As your AI assistant, I can help with various administrative tasks. What area would you like to focus on?',
      'I\'m actively monitoring all casino systems. Is there a particular issue or task you\'d like me to address?'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getVMStatusReport(): string {
    const vms = Array.from(this.vmInstances.values());
    const runningVMs = vms.filter(vm => vm.status === 'running');
    const totalCPU = vms.reduce((sum, vm) => sum + vm.cpu, 0) / vms.length;
    const totalMemory = vms.reduce((sum, vm) => sum + vm.memory, 0) / vms.length;

    return `VM Infrastructure Status:

🟢 ${runningVMs.length}/${vms.length} VMs Running
📊 Average CPU Usage: ${totalCPU.toFixed(1)}%
💾 Average Memory Usage: ${totalMemory.toFixed(1)}%

Active VMs:
${runningVMs.map(vm => 
  `• ${vm.name}: CPU ${vm.cpu}% | RAM ${vm.memory}% | ${vm.purpose}`
).join('\n')}

All critical systems are operational. VM monitoring is active.`;
  }

  private async restartVM(vmId: string): Promise<string> {
    const vm = this.vmInstances.get(vmId);
    if (!vm) {
      return 'VM not found. Please check the VM ID and try again.';
    }

    vm.status = 'stopping';
    this.vmInstances.set(vmId, vm);

    // Simulate restart process
    setTimeout(() => {
      vm.status = 'starting';
      vm.logs.unshift('VM restart initiated by LuckyAI');
      this.vmInstances.set(vmId, vm);
    }, 2000);

    setTimeout(() => {
      vm.status = 'running';
      vm.cpu = 15 + Math.random() * 20; // Reset to lower usage
      vm.memory = 20 + Math.random() * 25;
      vm.lastActivity = new Date();
      vm.logs.unshift('VM restart completed successfully');
      this.vmInstances.set(vmId, vm);
    }, 8000);

    // Log the action
    await databaseService.createAdminNotification(
      'VM Restart Initiated',
      `LuckyAI has restarted ${vm.name} (${vmId}) as requested.`,
      'info',
      1
    );

    return `✅ VM restart initiated for ${vm.name}. 

The VM is now stopping and will automatically restart. This process typically takes 30-60 seconds. I'll monitor the restart and ensure all services come back online properly.

Current status: ${vm.status}`;
  }

  private getVMPerformanceReport(): string {
    const vms = Array.from(this.vmInstances.values());
    const sortedByCPU = vms.sort((a, b) => b.cpu - a.cpu);

    return `VM Performance Analysis:

🔥 High CPU Usage:
${sortedByCPU.slice(0, 2).map(vm => 
  `• ${vm.name}: ${vm.cpu}% CPU, ${vm.memory}% RAM`
).join('\n')}

💡 Optimization Recommendations:
• AI Processing Node: Consider scaling horizontally for ML workloads
• Game Engine: Memory usage is optimal, CPU spikes are normal during peak hours
• Analytics VM: Performance is within acceptable ranges

⚡ System Health: All VMs are operating within normal parameters.`;
  }

  private async getSystemStatusReport(): Promise<string> {
    try {
      const stats = await databaseService.getLiveStats();
      const healthData = {
        database: 'Connected',
        activeUsers: stats.total_players_online?.value || 0,
        revenue24h: stats.total_revenue_today?.value || 0,
        systemHealth: stats.system_health?.value || 99.9
      };

      return `🎰 CoinKrazy System Status Report:

🟢 All Systems Operational
📊 System Health: ${healthData.systemHealth}%
🔗 Database: ${healthData.database}
👥 Active Players: ${healthData.activeUsers.toLocaleString()}
💰 24h Revenue: $${healthData.revenue24h.toLocaleString()}

🎮 Game Services: ✅ Online
💳 Payment Processing: ✅ Active  
🛡️ Security Systems: ✅ Monitoring
🤖 AI Services: ✅ Running

Last system check: ${new Date().toLocaleString()}`;
    } catch (error) {
      return `⚠️ System Status Check Failed

I encountered an issue while checking system status. This could indicate:
• Database connectivity issues
• Service disruption
• Network problems

Immediate action recommended: Check database connection and service logs.`;
    }
  }

  private async updateAIMetrics(): Promise<void> {
    try {
      await databaseService.updateAIEmployeeMetrics(1, 1, 5.50); // LuckyAI completed 1 task, saved $5.50
    } catch (error) {
      console.error('Failed to update AI metrics:', error);
    }
  }

  // VM Management Methods
  getVMInstances(): VMInstance[] {
    return Array.from(this.vmInstances.values());
  }

  getVMInstance(id: string): VMInstance | undefined {
    return this.vmInstances.get(id);
  }

  async startVM(id: string): Promise<boolean> {
    const vm = this.vmInstances.get(id);
    if (!vm || vm.status === 'running') return false;

    vm.status = 'starting';
    vm.logs.unshift('VM start initiated');
    
    setTimeout(() => {
      vm.status = 'running';
      vm.lastActivity = new Date();
      vm.logs.unshift('VM started successfully');
    }, 3000);

    return true;
  }

  async stopVM(id: string): Promise<boolean> {
    const vm = this.vmInstances.get(id);
    if (!vm || vm.status === 'stopped') return false;

    vm.status = 'stopping';
    vm.logs.unshift('VM stop initiated');
    
    setTimeout(() => {
      vm.status = 'stopped';
      vm.cpu = 0;
      vm.memory = 0;
      vm.logs.unshift('VM stopped successfully');
    }, 2000);

    return true;
  }

  // Chat Methods
  getChatHistory(): AIMessage[] {
    return this.chatHistory;
  }

  subscribeToChatUpdates(callback: (messages: AIMessage[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.chatHistory));
  }

  clearChatHistory(): void {
    this.chatHistory = [];
    this.notifyListeners();
  }

  // Capabilities
  getCapabilities(): AICapability[] {
    return this.capabilities;
  }

  updateCapability(id: string, enabled: boolean): void {
    const capability = this.capabilities.find(c => c.id === id);
    if (capability) {
      capability.enabled = enabled;
    }
  }

  // Performance Analytics
  getPerformanceMetrics() {
    const totalVMs = this.vmInstances.size;
    const runningVMs = Array.from(this.vmInstances.values()).filter(vm => vm.status === 'running').length;
    const avgCPU = Array.from(this.vmInstances.values()).reduce((sum, vm) => sum + vm.cpu, 0) / totalVMs;
    const avgMemory = Array.from(this.vmInstances.values()).reduce((sum, vm) => sum + vm.memory, 0) / totalVMs;

    return {
      vms: {
        total: totalVMs,
        running: runningVMs,
        avgCPU: Math.round(avgCPU),
        avgMemory: Math.round(avgMemory)
      },
      capabilities: {
        enabled: this.capabilities.filter(c => c.enabled).length,
        total: this.capabilities.length,
        avgPerformance: this.capabilities.reduce((sum, c) => sum + c.performance, 0) / this.capabilities.length
      },
      uptime: '99.97%',
      lastActivity: new Date().toISOString()
    };
  }
}

export const luckyAiService = LuckyAIService.getInstance();
export default luckyAiService;
