import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { useToast } from "../hooks/use-toast";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Shield,
  Clock,
  Activity,
  Filter,
  Search,
  MoreHorizontal,
} from "lucide-react";

interface PaymentProvider {
  id: number;
  name: string;
  type: "card" | "crypto" | "bank" | "ewallet";
  api_endpoint: string;
  is_enabled: boolean;
  supported_currencies: string[];
  fees: {
    deposit_fee_percent: number;
    withdrawal_fee_percent: number;
    fixed_fee: number;
  };
  limits: {
    min_deposit: number;
    max_deposit: number;
    min_withdrawal: number;
    max_withdrawal: number;
  };
  created_at: string;
}

interface PaymentMethod {
  id: number;
  user_id: number;
  provider_id: number;
  type: string;
  is_verified: boolean;
  is_default: boolean;
  metadata: any;
  created_at: string;
  provider_name?: string;
  user_email?: string;
}

interface Transaction {
  id: number;
  transaction_id: string;
  user_id: number;
  type: "deposit" | "withdrawal";
  status: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  fees: number;
  provider_id: number;
  payment_method_id: number;
  risk_score: number;
  notes: string;
  created_at: string;
  completed_at?: string;
  user_email?: string;
  provider_name?: string;
}

interface WithdrawalRequest {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  payment_method_id: number;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  admin_notes?: string;
  user_email?: string;
  payment_method_info?: string;
}

interface BankingSettings {
  deposit_enabled: boolean;
  withdrawal_enabled: boolean;
  max_daily_deposit: number;
  max_daily_withdrawal: number;
  min_withdrawal_amount: number;
  withdrawal_approval_required: boolean;
  risk_threshold: number;
  auto_approve_limit: number;
  kyc_required: boolean;
  maintenance_mode: boolean;
}

interface BankingStats {
  total_deposits_today: number;
  total_withdrawals_today: number;
  pending_withdrawals: number;
  high_risk_transactions: number;
  total_volume_24h: number;
  active_payment_methods: number;
  failed_transactions_today: number;
  average_transaction_time: number;
}

export default function BankingAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [bankingSettings, setBankingSettings] =
    useState<BankingSettings | null>(null);
  const [bankingStats, setBankingStats] = useState<BankingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [newProviderDialog, setNewProviderDialog] = useState(false);
  const [editProviderDialog, setEditProviderDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider | null>(null);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [
        providersRes,
        methodsRes,
        transactionsRes,
        withdrawalsRes,
        settingsRes,
        statsRes,
      ] = await Promise.all([
        fetch("/api/banking/providers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/banking/payment-methods", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/banking/transactions?limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/banking/withdrawals/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/banking/settings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/banking/analytics/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (providersRes.ok) setProviders(await providersRes.json());
      if (methodsRes.ok) setPaymentMethods(await methodsRes.json());
      if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      if (withdrawalsRes.ok) setWithdrawalRequests(await withdrawalsRes.json());
      if (settingsRes.ok) setBankingSettings(await settingsRes.json());
      if (statsRes.ok) setBankingStats(await statsRes.json());
    } catch (error) {
      console.error("Failed to load banking data:", error);
      toast({
        title: "Error",
        description: "Failed to load banking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderToggle = async (providerId: number, enabled: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/banking/providers/${providerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_enabled: enabled }),
      });

      if (response.ok) {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === providerId ? { ...p, is_enabled: enabled } : p,
          ),
        );
        toast({
          title: "Success",
          description: `Provider ${enabled ? "enabled" : "disabled"} successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update provider status",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawalAction = async (
    withdrawalId: number,
    action: "approve" | "reject",
    notes?: string,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/banking/withdrawals/${withdrawalId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ admin_notes: notes }),
        },
      );

      if (response.ok) {
        setWithdrawalRequests((prev) =>
          prev.filter((w) => w.id !== withdrawalId),
        );
        toast({
          title: "Success",
          description: `Withdrawal ${action}d successfully`,
        });
        loadBankingData(); // Refresh stats
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} withdrawal`,
        variant: "destructive",
      });
    }
  };

  const handleSettingsUpdate = async (
    newSettings: Partial<BankingSettings>,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/banking/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setBankingSettings((prev) => ({ ...prev!, ...newSettings }));
        toast({
          title: "Success",
          description: "Banking settings updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const exportTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/banking/transactions/export", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export transactions",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.transaction_id
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: {
      [key: string]: "default" | "secondary" | "destructive" | "outline";
    } = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 50) return <Badge variant="secondary">Medium Risk</Badge>;
    return <Badge variant="default">Low Risk</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banking Administration</h1>
          <p className="text-muted-foreground">
            Manage payment systems, transactions, and banking operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSettingsDialog(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={loadBankingData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {bankingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Volume (24h)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${bankingStats.total_volume_24h.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Deposits: ${bankingStats.total_deposits_today.toLocaleString()}{" "}
                | Withdrawals: $
                {bankingStats.total_withdrawals_today.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Withdrawals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bankingStats.pending_withdrawals}
              </div>
              <p className="text-xs text-muted-foreground">
                Requiring approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High Risk Transactions
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bankingStats.high_risk_transactions}
              </div>
              <p className="text-xs text-muted-foreground">Needs review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Health
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bankingStats.failed_transactions_today}
              </div>
              <p className="text-xs text-muted-foreground">
                Failed transactions today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent High-Risk Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions
                    .filter((t) => t.risk_score >= 70)
                    .slice(0, 5)
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {transaction.transaction_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.user_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${transaction.amount}</p>
                          {getRiskBadge(transaction.risk_score)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Deposits</span>
                    <Badge
                      variant={
                        bankingSettings?.deposit_enabled
                          ? "default"
                          : "destructive"
                      }
                    >
                      {bankingSettings?.deposit_enabled
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Withdrawals</span>
                    <Badge
                      variant={
                        bankingSettings?.withdrawal_enabled
                          ? "default"
                          : "destructive"
                      }
                    >
                      {bankingSettings?.withdrawal_enabled
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Maintenance Mode</span>
                    <Badge
                      variant={
                        bankingSettings?.maintenance_mode
                          ? "destructive"
                          : "default"
                      }
                    >
                      {bankingSettings?.maintenance_mode ? "Active" : "Normal"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Providers</span>
                    <Badge variant="outline">
                      {providers.filter((p) => p.is_enabled).length}/
                      {providers.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Payment Providers</h2>
            <Button onClick={() => setNewProviderDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>

          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {provider.name}
                        <Badge
                          variant={
                            provider.type === "card"
                              ? "default"
                              : provider.type === "crypto"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {provider.type.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{provider.api_endpoint}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={provider.is_enabled}
                        onCheckedChange={(enabled) =>
                          handleProviderToggle(provider.id, enabled)
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditProviderDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Deposit Fee</p>
                      <p className="font-medium">
                        {provider.fees.deposit_fee_percent}% + $
                        {provider.fees.fixed_fee}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Withdrawal Fee</p>
                      <p className="font-medium">
                        {provider.fees.withdrawal_fee_percent}% + $
                        {provider.fees.fixed_fee}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deposit Limits</p>
                      <p className="font-medium">
                        ${provider.limits.min_deposit} - $
                        {provider.limits.max_deposit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Withdrawal Limits</p>
                      <p className="font-medium">
                        ${provider.limits.min_withdrawal} - $
                        {provider.limits.max_withdrawal}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Transactions</h2>
            <Button variant="outline" onClick={exportTransactions}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">
                      {transaction.transaction_id}
                    </TableCell>
                    <TableCell>{transaction.user_email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "deposit"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {transaction.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {getRiskBadge(transaction.risk_score)}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
            <Badge variant="outline">{withdrawalRequests.length} Pending</Badge>
          </div>

          <div className="grid gap-4">
            {withdrawalRequests.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        ${withdrawal.amount.toLocaleString()}{" "}
                        {withdrawal.currency}
                      </CardTitle>
                      <CardDescription>{withdrawal.user_email}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {withdrawal.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Requested:{" "}
                        {new Date(withdrawal.requested_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Payment Method: {withdrawal.payment_method_info}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Reject Withdrawal
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject this withdrawal
                              request?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-2">
                            <Label htmlFor="reject-notes">Admin Notes</Label>
                            <Textarea
                              id="reject-notes"
                              placeholder="Reason for rejection..."
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleWithdrawalAction(withdrawal.id, "reject")
                              }
                            >
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleWithdrawalAction(withdrawal.id, "approve")
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Payment Methods</h2>
            <Badge variant="outline">{paymentMethods.length} Total</Badge>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>{method.user_email}</TableCell>
                    <TableCell>{method.provider_name}</TableCell>
                    <TableCell>{method.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={method.is_verified ? "default" : "secondary"}
                      >
                        {method.is_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {method.is_default && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(method.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Banking Settings Dialog */}
      <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Banking Settings</DialogTitle>
            <DialogDescription>
              Configure global banking system settings
            </DialogDescription>
          </DialogHeader>
          {bankingSettings && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deposit-enabled">Enable Deposits</Label>
                  <Switch
                    id="deposit-enabled"
                    checked={bankingSettings.deposit_enabled}
                    onCheckedChange={(checked) =>
                      handleSettingsUpdate({ deposit_enabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="withdrawal-enabled">Enable Withdrawals</Label>
                  <Switch
                    id="withdrawal-enabled"
                    checked={bankingSettings.withdrawal_enabled}
                    onCheckedChange={(checked) =>
                      handleSettingsUpdate({ withdrawal_enabled: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-daily-deposit">
                    Max Daily Deposit ($)
                  </Label>
                  <Input
                    id="max-daily-deposit"
                    type="number"
                    value={bankingSettings.max_daily_deposit}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        max_daily_deposit: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-daily-withdrawal">
                    Max Daily Withdrawal ($)
                  </Label>
                  <Input
                    id="max-daily-withdrawal"
                    type="number"
                    value={bankingSettings.max_daily_withdrawal}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        max_daily_withdrawal: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-withdrawal">
                    Min Withdrawal Amount ($)
                  </Label>
                  <Input
                    id="min-withdrawal"
                    type="number"
                    value={bankingSettings.min_withdrawal_amount}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        min_withdrawal_amount: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk-threshold">Risk Threshold (%)</Label>
                  <Input
                    id="risk-threshold"
                    type="number"
                    max="100"
                    value={bankingSettings.risk_threshold}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        risk_threshold: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <Switch
                  id="maintenance-mode"
                  checked={bankingSettings.maintenance_mode}
                  onCheckedChange={(checked) =>
                    handleSettingsUpdate({ maintenance_mode: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog
          open={!!selectedTransaction}
          onOpenChange={() => setSelectedTransaction(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Transaction ID: {selectedTransaction.transaction_id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">
                    ${selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Fees</Label>
                  <p className="font-medium">
                    ${selectedTransaction.fees.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{selectedTransaction.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="font-medium">{selectedTransaction.status}</p>
                </div>
                <div>
                  <Label>Risk Score</Label>
                  <p className="font-medium">
                    {selectedTransaction.risk_score}%
                  </p>
                </div>
                <div>
                  <Label>Currency</Label>
                  <p className="font-medium">{selectedTransaction.currency}</p>
                </div>
              </div>
              {selectedTransaction.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.notes}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
